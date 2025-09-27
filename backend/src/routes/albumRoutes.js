import { Router } from "express";
import { getAlbums, getAlbumById, searchAlbums } from "../controllers/albumControl.js";

const router = Router();

router.get("/", getAlbums);
router.get("/search", searchAlbums);
router.get("/:albumId", getAlbumById);

export default router;