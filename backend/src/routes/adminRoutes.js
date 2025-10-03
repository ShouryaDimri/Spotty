import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload, healthCheck } from "../controllers/adminControl.js";
import { getAllSongs } from "../controllers/songControl.js";
import { getAllAlbums } from "../controllers/albumControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Admin routes (require admin access)
router.get("/health", healthCheck);
router.get("/check", protectRoute, checkAdmin); // Require auth but allow all users
router.get("/songs", protectRoute, getAllSongs); // Get all songs for admin
router.get("/albums", protectRoute, getAllAlbums); // Get all albums for admin
router.post("/songs", protectRoute, requireAdmin, createSong);
router.post("/albums", protectRoute, requireAdmin, createAlbum);
router.delete("/songs/:id", protectRoute, requireAdmin, deleteSong);
router.delete("/albums/:id", protectRoute, requireAdmin, deleteAlbum);

// Public routes (all authenticated users can access)
router.post("/test-upload", testUpload); // Public for testing
router.post("/upload-song", protectRoute, createSong); // Require auth but allow all users

export default router;