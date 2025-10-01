import { Router } from "express";
import { getAlbums, getAlbumById, searchAlbums } from "../controllers/albumControl.js";

const router = Router();

router.get("/", getAlbums);
router.get("/search", searchAlbums);
// Temporarily remove the parameterized route to test if it's causing the issue
router.get("/album/:albumId", getAlbumById);

export default router;