import {User} from "../models/userModel.js"; // Mongoose User model
import { connectDB } from "../lib/db.js"; // Database connection function

export const getAllUsers = async (req, res) => {
  try {
    await connectDB();
    const currUserId = req.auth?.userId;
    const users = await User.find(currUserId ? { clerkId: { $ne: currUserId } } : {});
    return res.status(200).json(users);
  } catch (error) {
    console.warn("Using fallback empty users list due to DB error:", error.message);
    return res.status(200).json([]);
  }
};