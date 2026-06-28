import apiClient from "./apiClient";

export async function createRoom(quizId) {
    const { data } = await apiClient.post("/rooms", { quizId });
    return data.room;
}

export async function fetchRoom(roomId) {
    const { data } = await apiClient.get(`/rooms/${roomId}`);
    return data;
}

export async function fetchRoomByCode(code) {
    const { data } = await apiClient.get(`/rooms/code/${code}`);
    return data.room;
}

export async function joinRoom(code, displayName) {
    const { data } = await apiClient.post("/rooms/join", { code, displayName });
    return data;
}

export async function fetchOrganizerHistory() {
    const { data } = await apiClient.get("/rooms/history/organizer");
    return data.rooms;
}

export async function fetchParticipantHistory() {
    const { data } = await apiClient.get("/rooms/history/participant");
    return data.entries;
}
