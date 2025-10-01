import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check" , checkAdmin);

router.post("/songs", createSong );
// Temporarily remove the parameterized routes to test if they're causing the issue
router.delete("/songs/song/:id" , deleteSong);
router.post("/albums", createAlbum );
router.delete("/albums/album/:id" , deleteAlbum);

export default router;