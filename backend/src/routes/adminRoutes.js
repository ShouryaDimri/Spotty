import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from "../controllers/adminControl";
import { Song } from "../models/songModel";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check" , checkAdmin);

router.post("/songs", createSong );
router.delete("/songs/:id" , deleteSong);
router.post("/albums", createAlbum );
router.delete("/albums", deleteAlbum );

export default router;