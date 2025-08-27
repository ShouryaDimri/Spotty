import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getAllUsers} from "../controllers/userControl.js";

const router = Router();

router.get("/", protectRoute, getAllUsers);

export default router;