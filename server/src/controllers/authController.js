import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const USER_SELECT = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};

function createToken(userId) {
    return jwt.sign({ userId }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });
}

function sanitizeEmail(email = "") {
    return email.trim().toLowerCase();
}

function assertPassword(password) {
    if (typeof password !== "string" || password.length < 6) {
        throw new AppError("Пароль должен содержать минимум 6 символов.", 400);
    }
}

export async function register(request, response) {
    const { name, password, role = "ORGANIZER" } = request.body;
    const email = sanitizeEmail(request.body.email);

    if (!name?.trim() || name.trim().length < 2) {
        throw new AppError("Введите имя минимум из 2 символов.", 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new AppError("Введите корректный email.", 400);
    }

    assertPassword(password);

    if (!["ORGANIZER", "PARTICIPANT"].includes(role)) {
        throw new AppError("Некорректная роль пользователя.", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new AppError("Пользователь с таким email уже существует.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email,
            passwordHash,
            role,
        },
        select: USER_SELECT,
    });

    response.status(201).json({
        user,
        token: createToken(user.id),
    });
}

export async function login(request, response) {
    const email = sanitizeEmail(request.body.email);
    const { password } = request.body;

    if (!email || !password) {
        throw new AppError("Введите email и пароль.", 400);
    }

    const userWithPassword = await prisma.user.findUnique({
        where: { email },
    });

    if (!userWithPassword) {
        throw new AppError("Неверный email или пароль.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, userWithPassword.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Неверный email или пароль.", 401);
    }

    const { passwordHash: _passwordHash, ...user } = userWithPassword;

    response.status(200).json({
        user,
        token: createToken(user.id),
    });
}

export async function getCurrentUser(request, response) {
    response.status(200).json({
        user: request.user,
    });
}

export async function updateCurrentUser(request, response) {
    const name = request.body.name?.trim();
    const avatarUrl = request.body.avatarUrl?.trim() || null;

    if (!name || name.length < 2) {
        throw new AppError("Введите имя минимум из 2 символов.", 400);
    }

    const user = await prisma.user.update({
        where: { id: request.user.id },
        data: {
            name,
            avatarUrl,
        },
        select: USER_SELECT,
    });

    response.status(200).json({ user });
}
