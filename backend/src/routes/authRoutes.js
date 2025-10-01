import { Router } from "express";
import { authCallback } from "../controllers/authControl.js";

const router = Router();

console.log("✅ authRoutes loaded");

router.post("/callback", authCallback);

export default router;