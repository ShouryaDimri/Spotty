import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { getAllUsers, getUserById } from "../controllers/userControl.js";

const router = Router();

router.get("/", protectRoute, getAllUsers);

export default router;