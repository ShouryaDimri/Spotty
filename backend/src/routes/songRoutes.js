import { Router } from "express";
import { protectRoute,requireAdmin } from "../middleware/authMiddleware";
import { getAllSongs, getFeaturedSongs, getTrendingSongs } from "../controllers/songControl.js";

const router = Router();

router.get("/",protectRoute,requireAdmin, getAllSongs);
router.get("/made-for-you", getFeaturedSongs);
router.get("/trending", getTrendingSongs);

export default router;