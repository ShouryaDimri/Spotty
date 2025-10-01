import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/messageControl.js";

const router = Router();

// Temporarily remove the parameterized route to test if it's causing the issue
router.get("/user/:userId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);

export default router;