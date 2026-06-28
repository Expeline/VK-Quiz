import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../config/apiConfig";
import { tokenStorage } from "./apiClient";

export function createSocket() {
    return io(SOCKET_BASE_URL, {
        autoConnect: false,
        auth: {
            token: tokenStorage.get(),
        },
    });
}
