import {User} from "../models/userModel.js";

export const authCallback = async (req, res) => {
    try
  {
    const { id, firstName, lastName, imageUrl } = req.body;

    const user = await User.findone({ clerkId: id });
    if (!user) {
      await User.create({
        clerkId: id,
        fullName: `${firstName} ${lastName}`,
        imageUrl
    })

  } res.status(200).json({ message: "User processed successfully" });
  } catch (error) {
    console.log("Error in /callback:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}