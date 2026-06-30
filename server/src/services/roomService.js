import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

const ROOM_INCLUDE = {
    quiz: {
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
            questions: {
                orderBy: { order: "asc" },
                include: {
                    options: {
                        orderBy: { createdAt: "asc" },
                    },
                },
            },
        },
    },
    participants: {
        orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            answers: true,
        },
    },
};

function generateRoomCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let index = 0; index < 6; index += 1) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return code;
}

function getCurrentQuestion(room) {
    return room.quiz.questions[room.currentIndex] ?? null;
}

function sanitizeOption(option, includeCorrectAnswers) {
    return {
        id: option.id,
        text: option.text,
        imageUrl: option.imageUrl,
        ...(includeCorrectAnswers && { isCorrect: option.isCorrect }),
    };
}

function sanitizeQuestion(question, includeCorrectAnswers = false) {
    if (!question) {
        return null;
    }

    return {
        id: question.id,
        text: question.text,
        imageUrl: question.imageUrl,
        type: question.type,
        order: question.order,
        options: question.options.map((option) => sanitizeOption(option, includeCorrectAnswers)),
    };
}

function getParticipantAccuracy(participant) {
    const answers = participant.answers ?? [];
    const hasStoredAccuracy = (participant.answeredQuestionsCount ?? 0) > 0 || answers.length === 0;
    const answeredQuestionsCount = hasStoredAccuracy
        ? participant.answeredQuestionsCount ?? answers.length
        : answers.length;
    const correctAnswersCount = hasStoredAccuracy
        ? participant.correctAnswersCount ?? answers.filter((answer) => answer.isCorrect).length
        : answers.filter((answer) => answer.isCorrect).length;
    const accuracyPercent = hasStoredAccuracy && participant.accuracyPercent !== undefined && participant.accuracyPercent !== null
        ? participant.accuracyPercent
        : (answeredQuestionsCount ? Math.round((correctAnswersCount / answeredQuestionsCount) * 100) : 0);

    return {
        answeredQuestionsCount,
        correctAnswersCount,
        accuracyPercent,
    };
}

function sanitizeParticipant(participant) {
    const { answeredQuestionsCount, correctAnswersCount, accuracyPercent } = getParticipantAccuracy(participant);

    return {
        id: participant.id,
        userId: participant.userId,
        displayName: participant.displayName,
        score: participant.score,
        joinedAt: participant.joinedAt,
        answersCount: answeredQuestionsCount,
        correctAnswersCount,
        accuracyPercent,
        answeredQuestionIds: participant.answers?.map((answer) => answer.questionId) ?? [],
        answers: participant.answers?.map((answer) => ({
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds,
            isCorrect: answer.isCorrect,
            score: answer.score,
            responseTimeMs: answer.responseTimeMs,
            answeredAt: answer.answeredAt,
        })) ?? [],
    };
}

export function buildLeaderboard(participants) {
    return [...participants]
        .sort((first, second) => second.score - first.score || new Date(first.joinedAt) - new Date(second.joinedAt))
        .map((participant, index) => {
            const { answeredQuestionsCount, correctAnswersCount, accuracyPercent } = getParticipantAccuracy(participant);

            return {
                place: index + 1,
                participantId: participant.id,
                userId: participant.userId,
                displayName: participant.displayName,
                score: participant.score,
                answersCount: answeredQuestionsCount,
                correctAnswersCount,
                accuracyPercent,
            };
        });
}

export function serializeRoom(room, { includeCorrectAnswers = false } = {}) {
    const currentQuestion = getCurrentQuestion(room);

    return {
        id: room.id,
        code: room.code,
        status: room.status,
        phase: room.phase,
        currentIndex: room.currentIndex,
        currentQuestionStartedAt: room.currentQuestionStartedAt,
        questionRevealStartedAt: room.questionRevealStartedAt,
        startedAt: room.startedAt,
        endedAt: room.endedAt,
        quiz: {
            id: room.quiz.id,
            title: room.quiz.title,
            organizer: room.quiz.creator,
            description: room.quiz.description,
            category: room.quiz.category,
            timeLimit: room.quiz.timeLimit,
            rules: room.quiz.rules,
            showResults: room.quiz.showResults,
            questionsCount: room.quiz.questions.length,
        },
        currentQuestion: sanitizeQuestion(currentQuestion, includeCorrectAnswers),
        participants: room.participants.map(sanitizeParticipant),
        leaderboard: buildLeaderboard(room.participants),
    };
}

export async function findRoomById(roomId) {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: ROOM_INCLUDE,
    });

    if (!room) {
        throw new AppError("Комната не найдена.", 404);
    }

    return room;
}

export async function findRoomByCode(code) {
    if (!code?.trim()) {
        throw new AppError("Введите код комнаты.", 400);
    }

    const room = await prisma.room.findUnique({
        where: { code: code.trim().toUpperCase() },
        include: ROOM_INCLUDE,
    });

    if (!room) {
        throw new AppError("Комната не найдена.", 404);
    }

    return room;
}

export async function assertOrganizerRoom(roomId, userId) {
    const room = await findRoomById(roomId);

    if (room.organizerId !== userId) {
        throw new AppError("Нет доступа к этой комнате.", 403);
    }

    return room;
}

export async function createRoomForQuiz(quizId, organizerId) {
    if (!quizId) {
        throw new AppError("Укажите квиз для создания комнаты.", 400);
    }

    const quiz = await prisma.quiz.findFirst({
        where: {
            id: quizId,
            creatorId: organizerId,
        },
        include: {
            questions: true,
        },
    });

    if (!quiz) {
        throw new AppError("Квиз не найден.", 404);
    }

    if (quiz.questions.length === 0) {
        throw new AppError("Нельзя создать комнату для квиза без вопросов.", 400);
    }

    let createdRoom = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            createdRoom = await prisma.room.create({
                data: {
                    quizId,
                    organizerId,
                    code: generateRoomCode(),
                },
            });
            break;
        } catch (error) {
            if (error.code !== "P2002") {
                throw error;
            }
        }
    }

    if (!createdRoom) {
        throw new AppError("Не удалось создать уникальный код комнаты.", 500);
    }

    return findRoomById(createdRoom.id);
}

export async function joinRoomByCode(code, user, displayName) {
    const room = await findRoomByCode(code);

    if (room.status !== "WAITING") {
        throw new AppError("Подключение к комнате уже закрыто.", 409);
    }

    const participant = await prisma.participant.upsert({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId: user.id,
            },
        },
        update: {
            displayName: displayName?.trim() || user.name,
        },
        create: {
            roomId: room.id,
            userId: user.id,
            displayName: displayName?.trim() || user.name,
        },
    });

    return {
        room: await findRoomById(room.id),
        participant,
    };
}

export async function startRoom(roomId, organizerId) {
    const room = await assertOrganizerRoom(roomId, organizerId);

    if (room.status !== "WAITING") {
        throw new AppError("Квиз уже запущен или завершен.", 409);
    }

    if (room.quiz.questions.length === 0) {
        throw new AppError("В квизе нет вопросов.", 400);
    }

    if (room.participants.length === 0) {
        throw new AppError("Для старта нужен хотя бы один участник.", 400);
    }

    const now = new Date();

    await prisma.room.update({
        where: { id: roomId },
        data: {
            status: "ACTIVE",
            phase: "QUESTION",
            currentIndex: 0,
            startedAt: now,
            currentQuestionStartedAt: now,
            questionRevealStartedAt: null,
        },
    });

    return findRoomById(roomId);
}

export async function moveToNextQuestion(roomId, organizerId) {
    const room = await assertOrganizerRoom(roomId, organizerId);

    if (room.status !== "ACTIVE") {
        throw new AppError("Квиз не активен.", 409);
    }

    if (room.phase === "QUESTION") {
        return revealCurrentQuestion(roomId);
    }

    return advanceRoomAfterReveal(roomId);
}

async function recordMissingAnswers(room) {
    const question = getCurrentQuestion(room);

    if (!question) {
        return;
    }

    const answeredParticipantIds = new Set(
        room.participants
            .filter((participant) => participant.answers?.some((answer) => answer.questionId === question.id))
            .map((participant) => participant.id),
    );
    const missingParticipants = room.participants.filter((participant) => !answeredParticipantIds.has(participant.id));
    const missingAnswers = missingParticipants.map((participant) => ({
        participantId: participant.id,
        questionId: question.id,
        selectedOptionIds: [],
        isCorrect: false,
        score: 0,
        responseTimeMs: room.quiz.timeLimit * 1000,
        answeredAt: new Date(),
    }));

    if (missingAnswers.length) {
        await prisma.$transaction([
            prisma.participantAnswer.createMany({
                data: missingAnswers,
                skipDuplicates: true,
            }),
            ...missingParticipants.map((participant) => {
                const { answeredQuestionsCount, correctAnswersCount } = getParticipantAccuracy(participant);
                const nextAnswersCount = answeredQuestionsCount + 1;

                return prisma.participant.update({
                    where: { id: participant.id },
                    data: {
                        answeredQuestionsCount: nextAnswersCount,
                        correctAnswersCount,
                        accuracyPercent: Math.round((correctAnswersCount / nextAnswersCount) * 100),
                    },
                });
            }),
        ]);
    }
}

export function isCurrentQuestionFullyAnswered(room) {
    const question = getCurrentQuestion(room);

    if (!question || room.status !== "ACTIVE" || room.phase !== "QUESTION" || room.participants.length === 0) {
        return false;
    }

    return room.participants.every((participant) =>
        participant.answers?.some((answer) => answer.questionId === question.id),
    );
}

export async function revealCurrentQuestion(roomId) {
    const room = await findRoomById(roomId);

    if (room.status !== "ACTIVE") {
        return room;
    }

    if (room.phase === "REVEAL") {
        return room;
    }

    await recordMissingAnswers(room);

    await prisma.room.update({
        where: { id: roomId },
        data: {
            phase: "REVEAL",
            questionRevealStartedAt: new Date(),
        },
    });

    return findRoomById(roomId);
}

export async function advanceRoomAfterReveal(roomId) {
    const room = await findRoomById(roomId);

    if (room.status !== "ACTIVE") {
        return room;
    }

    if (room.currentIndex >= room.quiz.questions.length - 1) {
        await prisma.room.update({
            where: { id: roomId },
            data: {
                status: "FINISHED",
                phase: "REVEAL",
                endedAt: new Date(),
            },
        });
    } else {
        await prisma.room.update({
            where: { id: roomId },
            data: {
                phase: "QUESTION",
                currentIndex: room.currentIndex + 1,
                currentQuestionStartedAt: new Date(),
                questionRevealStartedAt: null,
            },
        });
    }

    return findRoomById(roomId);
}

export async function finishRoom(roomId, organizerId) {
    const room = await assertOrganizerRoom(roomId, organizerId);

    if (room.status === "ACTIVE") {
        await recordMissingAnswers(room);
    }

    await prisma.room.update({
        where: { id: roomId },
        data: {
            status: "FINISHED",
            endedAt: new Date(),
        },
    });

    return findRoomById(roomId);
}

function areOptionSetsEqual(firstIds, secondIds) {
    if (firstIds.length !== secondIds.length) {
        return false;
    }

    const firstSet = new Set(firstIds);
    return secondIds.every((id) => firstSet.has(id));
}

function calculateScore({ isCorrect, responseTimeMs, timeLimit }) {
    if (!isCorrect) {
        return 0;
    }

    const maxTimeMs = timeLimit * 1000;
    const timeRatio = Math.max(0, Math.min(1, 1 - responseTimeMs / maxTimeMs));

    return Math.round(1000 + timeRatio * 500);
}

export async function submitAnswer(roomId, userId, selectedOptionIds = []) {
    const room = await findRoomById(roomId);

    if (room.status !== "ACTIVE") {
        throw new AppError("Квиз не активен.", 409);
    }

    if (room.phase !== "QUESTION") {
        throw new AppError("Время ответа на этот вопрос завершено.", 409);
    }

    const participant = room.participants.find((entry) => entry.userId === userId);

    if (!participant) {
        throw new AppError("Вы не подключены к этой комнате.", 403);
    }

    const question = getCurrentQuestion(room);

    if (!question || !room.currentQuestionStartedAt) {
        throw new AppError("Текущий вопрос не найден.", 409);
    }

    const answeredAt = new Date();
    const responseTimeMs = answeredAt.getTime() - new Date(room.currentQuestionStartedAt).getTime();
    const timeLimitMs = room.quiz.timeLimit * 1000;

    if (responseTimeMs > timeLimitMs) {
        throw new AppError("Время ответа истекло.", 409);
    }

    const allowedOptionIds = new Set(question.options.map((option) => option.id));
    const uniqueSelectedOptionIds = [...new Set(selectedOptionIds)];

    if (!uniqueSelectedOptionIds.length || uniqueSelectedOptionIds.some((optionId) => !allowedOptionIds.has(optionId))) {
        throw new AppError("Некорректные варианты ответа.", 400);
    }

    if (question.type === "SINGLE_CHOICE" && uniqueSelectedOptionIds.length !== 1) {
        throw new AppError("Для этого вопроса можно выбрать только один ответ.", 400);
    }

    const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);
    const isCorrect = areOptionSetsEqual(uniqueSelectedOptionIds, correctOptionIds);
    const score = calculateScore({
        isCorrect,
        responseTimeMs,
        timeLimit: room.quiz.timeLimit,
    });
    const {
        answeredQuestionsCount: previousAnswersCount,
        correctAnswersCount: previousCorrectAnswersCount,
    } = getParticipantAccuracy(participant);
    const nextAnswersCount = previousAnswersCount + 1;
    const nextCorrectAnswersCount = previousCorrectAnswersCount + (isCorrect ? 1 : 0);
    const accuracyPercent = Math.round((nextCorrectAnswersCount / nextAnswersCount) * 100);

    try {
        await prisma.$transaction([
            prisma.participantAnswer.create({
                data: {
                    participantId: participant.id,
                    questionId: question.id,
                    selectedOptionIds: uniqueSelectedOptionIds,
                    isCorrect,
                    score,
                    responseTimeMs,
                    answeredAt,
                },
            }),
            prisma.participant.update({
                where: { id: participant.id },
                data: {
                    score: {
                        increment: score,
                    },
                    answeredQuestionsCount: nextAnswersCount,
                    correctAnswersCount: nextCorrectAnswersCount,
                    accuracyPercent,
                },
            }),
        ]);
    } catch (error) {
        if (error.code === "P2002") {
            throw new AppError("Ответ на этот вопрос уже отправлен.", 409);
        }

        throw error;
    }

    return {
        answer: {
            isCorrect,
            score,
            responseTimeMs,
            selectedOptionIds: uniqueSelectedOptionIds,
            questionId: question.id,
            correctOptionIds,
        },
        room: await findRoomById(roomId),
    };
}

export async function getOrganizerHistory(userId) {
    const rooms = await prisma.room.findMany({
        where: {
            organizerId: userId,
            status: "FINISHED",
        },
        orderBy: { endedAt: "desc" },
        include: ROOM_INCLUDE,
    });

    return rooms.map((room) => serializeRoom(room, { includeCorrectAnswers: true }));
}

export async function getParticipantHistory(userId) {
    const entries = await prisma.participant.findMany({
        where: {
            userId,
            room: {
                status: "FINISHED",
            },
        },
        orderBy: { updatedAt: "desc" },
        include: {
            answers: true,
            room: {
                include: ROOM_INCLUDE,
            },
        },
    });

    return entries.map((entry) => {
        const serializedRoom = serializeRoom(entry.room);
        const ownResult = serializedRoom.leaderboard.find((result) => result.participantId === entry.id);

        return {
            participantId: entry.id,
            displayName: entry.displayName,
            score: entry.score,
            answersCount: entry.answers.length,
            place: ownResult?.place ?? null,
            room: serializedRoom,
        };
    });
}
