import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.auth.userId;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.auth.userId;
        let fileUrl = null;
        let fileType = null;
        let fileName = null;

        if (!receiverId || (!message && !req.files?.file)) {
            return res.status(400).json({ message: "Receiver ID and message or file are required" });
        }

        // Handle file upload if present
        if (req.files?.file) {
            const file = req.files.file;
            
            // Check file size (20MB limit)
            if (file.size > 20 * 1024 * 1024) {
                return res.status(400).json({ message: "File size must be less than 20MB" });
            }

            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    resource_type: "auto",
                    folder: "chat_files"
                });
                
                fileUrl = result.secure_url;
                fileType = file.mimetype;
                fileName = file.name;
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                return res.status(500).json({ message: "Failed to upload file" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: message || '',
            fileUrl,
            fileType,
            fileName
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server error" });
    }
};