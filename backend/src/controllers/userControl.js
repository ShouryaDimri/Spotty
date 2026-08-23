import {User} from "../models/userModel.js"; // Mongoose User model
import { connectDB } from "../lib/db.js"; // Database connection function

export const getAllUsers = async (req, res) => {
  try {
    // Ensure database connection in serverless environment
    await connectDB();
    
    const currUserId = req.auth.userId; // Get current user's Clerk ID from request auth
    const users = await User.find({ clerkId: { $ne: currUserId } }); // Exclude current user
    // Return list of users
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in /users:", error); // Log error for debugging
    res.status(500).json({ message: "Internal server error", error });
  }
}