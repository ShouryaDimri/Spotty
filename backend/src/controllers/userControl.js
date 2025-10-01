import {User} from "../models/userModel.js";
import { connectDB } from "../lib/db.js";

export const getAllUsers = async (req, res) => {
  try {
    // Ensure database connection in serverless environment
    await connectDB();
    
    const currUserId = req.auth.userId;
    const users = await User.find({ clerkId: { $ne: currUserId } });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in /users:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}