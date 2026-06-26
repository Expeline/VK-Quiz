import { API_BASE_URL } from "../config/apiConfig";

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const apiClient = {
    get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options) =>
        request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    patch: (endpoint, body, options) =>
        request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" }),
};
