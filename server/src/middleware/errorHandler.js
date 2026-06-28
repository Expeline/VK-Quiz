import { env } from "../config/env.js";

export function errorHandler(error, _request, response, _next) {
    const statusCode = error.statusCode ?? 500;

    response.status(statusCode).json({
        status: "error",
        message: error.message ?? "Internal server error",
        ...(env.nodeEnv === "development" && { stack: error.stack }),
    });
}
