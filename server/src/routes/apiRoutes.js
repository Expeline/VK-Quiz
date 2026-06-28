import { Router } from "express";
import { getApiInfo } from "../controllers/apiController.js";
import authRoutes from "./authRoutes.js";
import quizRoutes from "./quizRoutes.js";
import roomRoutes from "./roomRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

router.get("/", getApiInfo);
router.use("/auth", authRoutes);
router.use("/quizzes", quizRoutes);
router.use("/rooms", roomRoutes);
router.use("/uploads", uploadRoutes);

export default router;
