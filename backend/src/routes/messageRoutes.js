import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../controllers/messageControl.js";

const router = Router();

// Temporarily disable authentication for testing
// router.get("/:userId", protectRoute, getMessages);
// router.post("/", protectRoute, sendMessage);
// router.put("/:messageId", protectRoute, editMessage);
// router.delete("/:messageId", protectRoute, deleteMessage);

router.get("/:userId", getMessages);
router.post("/", sendMessage);
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;