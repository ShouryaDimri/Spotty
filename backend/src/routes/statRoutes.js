import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { getStats } from "../controllers/statControl.js";

const router = Router();

router.get("/", getStats); // Public access for testing

export default router;