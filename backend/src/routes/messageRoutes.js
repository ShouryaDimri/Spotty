import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../controllers/messageControl.js";

const router = Router();

router.get("/:userId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);
router.put("/:messageId", protectRoute, editMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;