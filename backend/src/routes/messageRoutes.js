import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getAllMessages, getMessages, sendMessage, editMessage, deleteMessage } from "../controllers/messageControl.js";

const router = Router();

router.get("/all", getAllMessages); // Get all messages (public for testing)
router.get("/:userId", protectRoute, getMessages); // Get messages by user with auth
router.post("/", protectRoute, sendMessage); // Send message with auth
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;