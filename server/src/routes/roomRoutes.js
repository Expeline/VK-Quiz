import { Router } from "express";
import {
    createRoom,
    getMyOrganizerHistory,
    getMyParticipantHistory,
    getRoom,
    getRoomByCode,
    joinRoom,
} from "../controllers/roomController.js";
import { authMiddleware, requireOrganizer } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authMiddleware);

router.post("/", requireOrganizer, asyncHandler(createRoom));
router.get("/history/organizer", requireOrganizer, asyncHandler(getMyOrganizerHistory));
router.get("/history/participant", asyncHandler(getMyParticipantHistory));
router.get("/code/:code", asyncHandler(getRoomByCode));
router.post("/join", asyncHandler(joinRoom));
router.get("/:id", asyncHandler(getRoom));

export default router;
