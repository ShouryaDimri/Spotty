import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin, testUpload } from "../controllers/adminControl.js";
import { Song } from "../models/songModel.js";

const router = Router();

// Temporarily disable all auth checks for testing
// router.use(protectRoute);
// router.use(protectRoute, requireAdmin);

router.get("/check" , checkAdmin);

router.post("/test-upload", testUpload);
router.post("/songs", createSong );
router.post("/albums", createAlbum );

// Add simple test endpoints instead
router.delete("/songs/test", (req, res) => {
  res.status(200).json({ message: "Test song delete endpoint working" });
});
router.delete("/albums/test", (req, res) => {
  res.status(200).json({ message: "Test album delete endpoint working" });
});

export default router;