import {
    createRoomForQuiz,
    findRoomById,
    findRoomByCode,
    getOrganizerHistory,
    getParticipantHistory,
    joinRoomByCode,
    serializeRoom,
} from "../services/roomService.js";

export async function createRoom(request, response) {
    const room = await createRoomForQuiz(request.body.quizId, request.user.id);

    response.status(201).json({
        room: serializeRoom(room, { includeCorrectAnswers: true }),
    });
}

export async function getRoom(request, response) {
    const room = await findRoomById(request.params.id);
    const isOrganizer = room.organizerId === request.user.id;
    const isParticipant = room.participants.some((participant) => participant.userId === request.user.id);

    if (!isOrganizer && !isParticipant) {
        response.status(403).json({
            status: "error",
            message: "Нет доступа к этой комнате.",
        });
        return;
    }

    response.status(200).json({
        room: serializeRoom(room, { includeCorrectAnswers: isOrganizer }),
        role: isOrganizer ? "ORGANIZER" : "PARTICIPANT",
        participant: room.participants.find((participant) => participant.userId === request.user.id) ?? null,
    });
}

export async function getRoomByCode(request, response) {
    const room = await findRoomByCode(request.params.code);

    response.status(200).json({
        room: serializeRoom(room),
    });
}

export async function joinRoom(request, response) {
    const { room, participant } = await joinRoomByCode(request.body.code, request.user, request.body.displayName);

    response.status(200).json({
        room: serializeRoom(room),
        participant,
    });
}

export async function getMyOrganizerHistory(request, response) {
    const rooms = await getOrganizerHistory(request.user.id);

    response.status(200).json({ rooms });
}

export async function getMyParticipantHistory(request, response) {
    const entries = await getParticipantHistory(request.user.id);

    response.status(200).json({ entries });
}
