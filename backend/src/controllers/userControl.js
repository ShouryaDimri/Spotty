import {User} from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const currUserId = req.auth.userId;
    const users = await User.find({ clerkId: { $ne: currUserId } });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in /users:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}
