import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const currUserId = req.auth.userId;
        const users = await User.find({clerkId : { $ne: currUserId } });
    } catch (error) {
        
    }
}