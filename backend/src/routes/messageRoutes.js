import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../controllers/messageControl.js";

const router = Router();

router.get("/", getMessages); // Get all messages for testing
router.get("/:userId", getMessages); // Get messages by user
router.post("/", sendMessage); // Temporarily remove auth for testing
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;