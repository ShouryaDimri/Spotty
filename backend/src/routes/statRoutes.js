import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { getStats } from "../controllers/statControl.js";

const router = Router();

router.get("/", protectRoute, getStats); // Require auth but allow all users

export default router;