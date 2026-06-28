import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function authMiddleware(request, _response, next) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Требуется авторизация.", 401);
        }

        const token = authHeader.slice("Bearer ".length);
        const payload = jwt.verify(token, env.jwtSecret);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                role: true,
            },
        });

        if (!user) {
            throw new AppError("Пользователь не найден.", 401);
        }

        request.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }

        next(new AppError("Недействительный токен авторизации.", 401));
    }
}

export function requireOrganizer(request, _response, next) {
    if (request.user?.role !== "ORGANIZER") {
        next(new AppError("Доступ разрешен только организатору.", 403));
        return;
    }

    next();
}
