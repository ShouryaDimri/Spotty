import express from "express";
import { updateUserStatus, getUserStatuses, getUserStatus } from "../controllers/userStatusControl.js";

const router = express.Router();

// Update user status
router.post("/", updateUserStatus);

// Get all user statuses
router.get("/", getUserStatuses);

// Get specific user status
router.get("/:userId", getUserStatus);

export default router;
