import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload, healthCheck } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Temporarily disable all auth checks for testing
// router.use(protectRoute, requireAdmin);
// router.use(protectRoute);

// All routes are now public for testing
router.get("/health", healthCheck);
router.get("/check" , checkAdmin);
router.post("/test-upload", testUpload);
router.post("/upload-song", createSong); // Regular users can upload songs
router.post("/songs", createSong );
router.post("/albums", createAlbum );
router.delete("/songs/:id", deleteSong);
router.delete("/albums/:id", deleteAlbum);

export default router;