import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload, healthCheck, getSongs } from "../controllers/adminControl.js";
import { getAllSongs } from "../controllers/songControl.js";
import { getAllAlbums } from "../controllers/albumControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Admin routes (require admin access)
router.get("/health", healthCheck);
router.get("/check", protectRoute, checkAdmin); // Require auth but allow all users
router.get("/songs", getSongs); // Get all songs for admin with liked info - public for testing
router.get("/albums", getAllAlbums); // Get all albums for admin - public for testing
router.post("/songs", protectRoute, requireAdmin, createSong);
router.post("/albums", protectRoute, requireAdmin, createAlbum);
router.delete("/songs/:id", deleteSong); // Public for testing
router.delete("/albums/:id", protectRoute, requireAdmin, deleteAlbum);

// Public routes (all authenticated users can access)
router.post("/test-upload", testUpload); // Public for testing
router.post("/upload-song", createSong); // Public for testing uploads

export default router;