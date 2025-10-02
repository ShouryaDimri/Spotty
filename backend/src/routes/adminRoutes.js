import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Admin routes (require admin access)
router.use(protectRoute, requireAdmin);
router.get("/check" , checkAdmin);
router.post("/songs", createSong );
router.post("/albums", createAlbum );
router.delete("/songs/:id", deleteSong);
router.delete("/albums/:id", deleteAlbum);

// Public routes (all authenticated users can access)
const publicRouter = Router();
publicRouter.use(protectRoute); // Only require authentication, not admin

publicRouter.post("/test-upload", testUpload);
publicRouter.post("/upload-song", createSong); // Regular users can upload songs

// Use both routers
router.use(publicRouter);

export default router;