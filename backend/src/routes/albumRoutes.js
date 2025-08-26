import { Router } from "express";
import { getAlbums, getAlbumById } from "../controllers/albumControl.js";

const router = Router();

router.get("/", getAlbums);
router.get("/:albumId", getAlbumById);

export default router;