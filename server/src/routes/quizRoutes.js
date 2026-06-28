import { Router } from "express";
import {
    createQuestion,
    createQuiz,
    deleteQuestion,
    deleteQuiz,
    getQuizById,
    getQuizQuestions,
    getQuizzes,
    updateQuestion,
    updateQuiz,
} from "../controllers/quizController.js";
import { authMiddleware, requireOrganizer } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authMiddleware, requireOrganizer);

router.post("/", asyncHandler(createQuiz));
router.get("/", asyncHandler(getQuizzes));
router.get("/:id", asyncHandler(getQuizById));
router.patch("/:id", asyncHandler(updateQuiz));
router.delete("/:id", asyncHandler(deleteQuiz));

router.get("/:quizId/questions", asyncHandler(getQuizQuestions));
router.post("/:quizId/questions", asyncHandler(createQuestion));
router.patch("/:quizId/questions/:questionId", asyncHandler(updateQuestion));
router.delete("/:quizId/questions/:questionId", asyncHandler(deleteQuestion));

export default router;
