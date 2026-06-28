import apiClient from "./apiClient";

export async function loginUser(credentials) {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
}

export async function registerUser(payload) {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
}

export async function fetchCurrentUser() {
    const { data } = await apiClient.get("/auth/me");
    return data.user;
}

export async function updateCurrentUser(payload) {
    const { data } = await apiClient.patch("/auth/me", payload);
    return data.user;
}
