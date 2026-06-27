import { useCallback, useMemo, useState } from "react";
import { tokenStorage } from "../../api/apiClient";
import { ROLES } from "../../constants/roles";
import { AuthContext } from "./authContext";

const USER_STORAGE_KEY = "vk_quiz_user";

function createMockToken(email) {
    return `mock-jwt-${btoa(email)}-${Date.now()}`;
}

function readStoredUser() {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        tokenStorage.clear();
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [token, setToken] = useState(tokenStorage.get);

    const saveSession = useCallback((nextUser, nextToken) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        tokenStorage.set(nextToken);
        setUser(nextUser);
        setToken(nextToken);
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const nextUser = {
            id: crypto.randomUUID(),
            name: email.split("@")[0],
            email,
            role: ROLES.ORGANIZER,
        };
        const nextToken = createMockToken(`${email}:${password}`);

        saveSession(nextUser, nextToken);
        return nextUser;
    }, [saveSession]);

    const register = useCallback(async ({ name, email, password, role }) => {
        const nextUser = {
            id: crypto.randomUUID(),
            name,
            email,
            role,
        };
        const nextToken = createMockToken(`${email}:${password}`);

        saveSession(nextUser, nextToken);
        return nextUser;
    }, [saveSession]);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_STORAGE_KEY);
        tokenStorage.clear();
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            login,
            logout,
            register,
        }),
        [user, token, login, logout, register],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
