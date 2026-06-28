import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import {
    advanceRoomAfterReveal,
    findRoomById,
    finishRoom,
    isCurrentQuestionFullyAnswered,
    joinRoomByCode,
    moveToNextQuestion,
    revealCurrentQuestion,
    serializeRoom,
    startRoom,
    submitAnswer,
} from "../services/roomService.js";

const REVEAL_DURATION_MS = 10000;
const roomTimers = new Map();

function getTokenFromSocket(socket) {
    const authToken = socket.handshake.auth?.token;

    if (authToken) {
        return authToken;
    }

    const header = socket.handshake.headers.authorization;

    if (header?.startsWith("Bearer ")) {
        return header.slice("Bearer ".length);
    }

    return null;
}

async function authenticateSocket(socket, next) {
    try {
        const token = getTokenFromSocket(socket);

        if (!token) {
            next(new Error("Требуется авторизация."));
            return;
        }

        const payload = jwt.verify(token, env.jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                role: true,
            },
        });

        if (!user) {
            next(new Error("Пользователь не найден."));
            return;
        }

        socket.user = user;
        next();
    } catch {
        next(new Error("Недействительный токен авторизации."));
    }
}

function emitRoomState(io, room, options = {}) {
    io.to(room.id).emit("room:state", serializeRoom(room, options));
}

function shouldExposeAnswers(room) {
    return Boolean(room.quiz.showResults && (room.phase === "REVEAL" || room.status === "FINISHED"));
}

function clearRoomTimer(roomId) {
    const timer = roomTimers.get(roomId);

    if (timer) {
        clearTimeout(timer);
        roomTimers.delete(roomId);
    }
}

function emitQuestionEvent(io, room) {
    const eventName = room.status === "FINISHED" ? "quiz:finished" : room.phase === "REVEAL" ? "quiz:reveal" : "quiz:question";
    io.to(room.id).emit(eventName, serializeRoom(room, { includeCorrectAnswers: shouldExposeAnswers(room) }));
}

function scheduleQuestionTimer(io, room) {
    clearRoomTimer(room.id);

    if (room.status !== "ACTIVE") {
        return;
    }

    const isReveal = room.phase === "REVEAL";
    const startedAt = new Date(isReveal ? room.questionRevealStartedAt : room.currentQuestionStartedAt).getTime();
    const duration = isReveal ? REVEAL_DURATION_MS : room.quiz.timeLimit * 1000;
    const delay = Math.max(0, startedAt + duration - Date.now());
    const timer = setTimeout(async () => {
        try {
            const nextRoom = isReveal ? await advanceRoomAfterReveal(room.id) : await revealCurrentQuestion(room.id);
            emitRoomState(io, nextRoom, { includeCorrectAnswers: shouldExposeAnswers(nextRoom) });
            emitQuestionEvent(io, nextRoom);

            if (nextRoom.status === "ACTIVE") {
                scheduleQuestionTimer(io, nextRoom);
            } else {
                clearRoomTimer(nextRoom.id);
            }
        } catch (error) {
            io.to(room.id).emit("room:error", {
                message: error.message ?? "Не удалось переключить вопрос.",
            });
        }
    }, delay);

    roomTimers.set(room.id, timer);
}

function handleSocketError(socket, error) {
    socket.emit("room:error", {
        message: error.message ?? "Ошибка комнаты.",
    });
}

export function initializeSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: env.allowedClientOrigins,
            credentials: true,
        },
    });

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.emit("user:connected", {
            socketId: socket.id,
            user: socket.user,
        });

        socket.on("room:join", async ({ roomId, code, displayName } = {}) => {
            try {
                let room;

                if (code) {
                    const joined = await joinRoomByCode(code, socket.user, displayName);
                    room = joined.room;
                    socket.emit("room:joined", {
                        room: serializeRoom(room),
                        participant: joined.participant,
                    });
                } else {
                    room = await findRoomById(roomId);
                    const isOrganizer = room.organizerId === socket.user.id;
                    const isParticipant = room.participants.some((participant) => participant.userId === socket.user.id);

                    if (!isOrganizer && !isParticipant) {
                        throw new Error("Нет доступа к этой комнате.");
                    }

                    socket.emit("room:joined", {
                        room: serializeRoom(room, { includeCorrectAnswers: isOrganizer }),
                    });
                }

                socket.join(room.id);
                emitRoomState(io, room);
                if (room.status === "ACTIVE") {
                    scheduleQuestionTimer(io, room);
                }
                socket.to(room.id).emit("participant:joined", {
                    userId: socket.user.id,
                    name: socket.user.name,
                });
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        socket.on("room:leave", ({ roomId } = {}) => {
            if (roomId) {
                socket.leave(roomId);
                socket.to(roomId).emit("participant:left", {
                    userId: socket.user.id,
                    name: socket.user.name,
                });
            }
        });

        socket.on("quiz:start", async ({ roomId } = {}) => {
            try {
                const room = await startRoom(roomId, socket.user.id);
                emitRoomState(io, room);
                io.to(room.id).emit("quiz:started", serializeRoom(room));
                scheduleQuestionTimer(io, room);
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        socket.on("quiz:next", async ({ roomId } = {}) => {
            try {
                const room = await moveToNextQuestion(roomId, socket.user.id);
                emitRoomState(io, room, { includeCorrectAnswers: shouldExposeAnswers(room) });
                emitQuestionEvent(io, room);
                if (room.status === "ACTIVE") {
                    scheduleQuestionTimer(io, room);
                } else {
                    clearRoomTimer(room.id);
                }
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        socket.on("quiz:finish", async ({ roomId } = {}) => {
            try {
                const room = await finishRoom(roomId, socket.user.id);
                clearRoomTimer(room.id);
                emitRoomState(io, room, { includeCorrectAnswers: shouldExposeAnswers(room) });
                io.to(room.id).emit("quiz:finished", serializeRoom(room, { includeCorrectAnswers: shouldExposeAnswers(room) }));
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        socket.on("answer:submit", async ({ roomId, selectedOptionIds } = {}) => {
            try {
                const result = await submitAnswer(roomId, socket.user.id, selectedOptionIds);
                socket.emit("answer:result", result.answer);
                if (isCurrentQuestionFullyAnswered(result.room)) {
                    const nextRoom = await revealCurrentQuestion(roomId);
                    emitRoomState(io, nextRoom, { includeCorrectAnswers: shouldExposeAnswers(nextRoom) });
                    emitQuestionEvent(io, nextRoom);
                    if (nextRoom.status === "ACTIVE") {
                        scheduleQuestionTimer(io, nextRoom);
                    } else {
                        clearRoomTimer(nextRoom.id);
                    }
                } else {
                    emitRoomState(io, result.room);
                }
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
            socket.broadcast.emit("user:disconnected", {
                socketId: socket.id,
                userId: socket.user?.id,
            });
        });
    });

    return io;
}
