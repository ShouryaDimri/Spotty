import { Router } from "express";
import { protectRoute,requireAdmin } from "../middleware/authMiddleware.js";
import { getAllSongs, getFeaturedSongs, getTrendingSongs, searchSongs } from "../controllers/songControl.js";

const router = Router();

router.get("/", getAllSongs);
router.get("/made-for-you", getFeaturedSongs);
router.get("/trending", getTrendingSongs);
router.get("/search", searchSongs);

export default router;