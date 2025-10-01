import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/messageControl.js";

const router = Router();

router.get("/:userId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);

export default router;