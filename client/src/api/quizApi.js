import apiClient from "./apiClient";

export async function fetchQuizzes() {
    const { data } = await apiClient.get("/quizzes");
    return data.quizzes;
}

export async function fetchQuiz(id) {
    const { data } = await apiClient.get(`/quizzes/${id}`);
    return data.quiz;
}

export async function createQuiz(payload) {
    const { data } = await apiClient.post("/quizzes", payload);
    return data.quiz;
}

export async function updateQuiz(id, payload) {
    const { data } = await apiClient.patch(`/quizzes/${id}`, payload);
    return data.quiz;
}

export async function deleteQuiz(id) {
    await apiClient.delete(`/quizzes/${id}`);
}
