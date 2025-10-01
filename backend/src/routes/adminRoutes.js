import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check" , checkAdmin);

router.post("/songs", createSong );
router.delete("/songs/:id" , deleteSong);
router.post("/albums", createAlbum );
router.delete("/albums/:id" , deleteAlbum);

export default router;