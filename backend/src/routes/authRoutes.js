import { Router } from "express";
import { authCallback } from "../controllers/authControl.js";

const router = Router();

router.post("/callback", authCallback);

export default router;