import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload, healthCheck } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Admin routes (require admin access)
router.get("/health", healthCheck);
router.get("/check", checkAdmin);
router.post("/songs", protectRoute, requireAdmin, createSong);
router.post("/albums", protectRoute, requireAdmin, createAlbum);
router.delete("/songs/:id", protectRoute, requireAdmin, deleteSong);
router.delete("/albums/:id", protectRoute, requireAdmin, deleteAlbum);

// Public routes (all authenticated users can access)
router.post("/test-upload", protectRoute, testUpload);
router.post("/upload-song", protectRoute, createSong); // Regular users can upload songs

export default router;