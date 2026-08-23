import mongoose from "mongoose";
console.log("✅ userModel loaded");

const userSchema = new mongoose.Schema( // Define User schema
	// User's full name, image URL, and Clerk ID
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ timestamps: true } //  createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema); // Export User model