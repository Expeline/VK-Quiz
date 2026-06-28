import dotenv from "dotenv";

dotenv.config();

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 5001),
    clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
    allowedClientOrigins: [
        process.env.CLIENT_URL ?? "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET ?? "change-me-before-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};
