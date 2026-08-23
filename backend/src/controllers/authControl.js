import {User} from "../models/userModel.js"; // Mongoose User model
import { connectDB } from "../lib/db.js"; // Database connection function

export const authCallback = async (req, res) => {
  console.log("✅ /api/auth/callback route hit");
  console.log("Request body:", req.body);
  
  try {
    // Ensure database connection in serverless environment
    await connectDB();
    
    const { id, firstName, lastName, imageUrl } = req.body; // Destructure Clerk user data
    console.log("Clerk user data received:", { id, firstName, lastName, imageUrl });

    const user = await User.findOne({ clerkId: id }); // Check if user already exists
    console.log("User found:", user);
    
    if (!user) {
      console.log("Creating new user...");
      await User.create({  // Create new user in database if user doesn't exist
        clerkId: id,
        fullName: `${firstName} ${lastName}`,
        imageUrl
      });
      console.log("New user created successfully");
    }

    res.status(200).json({ message: "User processed successfully" });
  } catch (error) {
    console.log("Error in /callback:", error); // Log error for debugging
    res.status(500).json({ message: "Internal server error", error });
  }
}