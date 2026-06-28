import { Router } from "express";
import { login, register, getCurrentUser, updateCurrentUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(getCurrentUser));
router.patch("/me", authMiddleware, asyncHandler(updateCurrentUser));

export default router;
