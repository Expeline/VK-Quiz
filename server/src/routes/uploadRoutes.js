import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const router = Router();
const uploadDir = path.resolve("src/uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename(_request, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase() || ".png";
        callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter(_request, file, callback) {
        if (!file.mimetype.startsWith("image/")) {
            callback(new AppError("Можно загружать только изображения.", 400));
            return;
        }

        callback(null, true);
    },
});

router.post("/image", authMiddleware, upload.single("image"), asyncHandler(uploadImage));

export default router;
