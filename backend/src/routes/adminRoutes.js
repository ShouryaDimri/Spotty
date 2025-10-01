import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from "../controllers/adminControl.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check" , checkAdmin);

router.post("/songs", createSong );
// Temporarily remove parameterized routes to test
router.post("/test-song", (req, res) => {
  res.status(200).json({ message: "Test song endpoint working" });
});
router.post("/albums", createAlbum );
router.post("/test-album", (req, res) => {
  res.status(200).json({ message: "Test album endpoint working" });
});

export default router;