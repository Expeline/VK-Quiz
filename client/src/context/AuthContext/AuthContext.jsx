import { useCallback, useMemo, useState } from "react";
import { tokenStorage } from "../../api/apiClient";
import { loginUser, registerUser, updateCurrentUser } from "../../api/authApi";
import { AuthContext } from "./authContext";

const USER_STORAGE_KEY = "vk_quiz_user";

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

    const login = useCallback(async (credentials) => {
        const { user: nextUser, token: nextToken } = await loginUser(credentials);

        saveSession(nextUser, nextToken);
        return nextUser;
    }, [saveSession]);

    const register = useCallback(async (payload) => {
        const { user: nextUser, token: nextToken } = await registerUser(payload);

        saveSession(nextUser, nextToken);
        return nextUser;
    }, [saveSession]);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_STORAGE_KEY);
        tokenStorage.clear();
        setUser(null);
        setToken(null);
    }, []);

    const updateProfile = useCallback(async (payload) => {
        const nextUser = await updateCurrentUser(payload);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        return nextUser;
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            login,
            logout,
            register,
            updateProfile,
        }),
        [user, token, login, logout, register, updateProfile],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
