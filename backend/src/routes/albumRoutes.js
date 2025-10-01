import { Router } from "express";
import { getAlbums, getAlbumById, searchAlbums } from "../controllers/albumControl.js";

const router = Router();

router.get("/", getAlbums);
router.get("/search", searchAlbums);
// Temporarily remove parameterized route to test
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Album test endpoint working" });
});

export default router;