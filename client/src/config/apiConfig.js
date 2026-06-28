const fallbackApiBaseUrl = "http://localhost:5001/api";

export const API_BASE_URL = import.meta.env.VITE_API_URL || fallbackApiBaseUrl;

const socketBaseFromApi = API_BASE_URL.replace(/\/api$/, "");

export const SOCKET_BASE_URL =
    import.meta.env.VITE_SOCKET_URL || socketBaseFromApi || window.location.origin;
