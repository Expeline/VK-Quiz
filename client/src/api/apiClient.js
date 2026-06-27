import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const TOKEN_STORAGE_KEY = "vk_quiz_token";

export const tokenStorage = {
    get: () => localStorage.getItem(TOKEN_STORAGE_KEY),
    set: (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_STORAGE_KEY),
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.get();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiClient;
