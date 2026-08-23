import {User} from "../models/userModel.js"; // Mongoose User model
import { connectDB } from "../lib/db.js"; // Database connection function

export const authCallback = async (req, res) => {
  try {
    await connectDB();
    const { id, firstName, lastName, imageUrl } = req.body;
    if (id) {
      const user = await User.findOne({ clerkId: id });
      if (!user) {
        await User.create({
          clerkId: id,
          fullName: `${firstName || ''} ${lastName || ''}`.trim() || 'User',
          imageUrl: imageUrl || '/cover-images/1.jpg'
        });
      }
    }
    return res.status(200).json({ success: true, message: "User processed successfully" });
  } catch (error) {
    console.warn("Auth callback warning:", error.message);
    return res.status(200).json({ success: true, message: "Auth fallback processed" });
  }
};