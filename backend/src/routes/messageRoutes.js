import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/messageControl.js";

const router = Router();

// Temporarily remove parameterized route to test
router.get("/test", protectRoute, (req, res) => {
  res.status(200).json({ message: "Test endpoint working" });
});
router.post("/", protectRoute, sendMessage);

export default router;