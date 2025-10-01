import {User} from "../models/userModel.js";
import { connectDB } from "../lib/db.js";

export const authCallback = async (req, res) => {
  console.log("✅ /api/auth/callback route hit");
  console.log("Request body:", req.body);
  
  try {
    // Ensure database connection in serverless environment
    await connectDB();
    
    const { id, firstName, lastName, imageUrl } = req.body;

    const user = await User.findOne({ clerkId: id });
    console.log("User found:", user);
    
    if (!user) {
      console.log("Creating new user...");
      await User.create({
        clerkId: id,
        fullName: `${firstName} ${lastName}`,
        imageUrl
      });
      console.log("New user created successfully");
    }

    res.status(200).json({ message: "User processed successfully" });
  } catch (error) {
    console.log("Error in /callback:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}