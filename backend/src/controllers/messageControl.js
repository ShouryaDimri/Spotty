import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";
import { connectDB } from "../lib/db.js";

export const getMessages = async (req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
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
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { receiverId, message, replyToId } = req.body;
        const senderId = req.auth.userId;
        let fileUrl = null;
        let fileType = null;
        let fileName = null;
        let replyToData = null;

        if (!receiverId || (!message && !req.files?.file)) {
            return res.status(400).json({ message: "Receiver ID and message or file are required" });
        }

        // Handle reply if present
        if (replyToId) {
            const replyMessage = await Message.findById(replyToId);
            if (replyMessage) {
                const replySender = await User.findOne({ clerkId: replyMessage.senderId });
                replyToData = {
                    messageId: replyMessage._id,
                    message: replyMessage.message,
                    senderName: replySender?.fullName || 'Unknown'
                };
            }
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
            fileName,
            replyTo: replyToData
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        await connectDB();
        
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.auth?.userId;

        console.log("Edit message request:", { messageId, message, userId });

        if (!userId) {
            console.log("No userId found in request");
            return res.status(401).json({ 
                success: false,
                message: "Authentication required",
                code: "UNAUTHORIZED"
            });
        }

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Message ID is required",
                code: "MISSING_MESSAGE_ID"
            });
        }

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
                code: "MISSING_MESSAGE_CONTENT"
            });
        }

        const msg = await Message.findById(messageId);
        
        if (!msg) {
            console.log("Message not found:", messageId);
            return res.status(404).json({ 
                success: false,
                message: "Message not found",
                code: "MESSAGE_NOT_FOUND"
            });
        }

        console.log("Message found:", { senderId: msg.senderId, userId });

        if (msg.senderId !== userId) {
            console.log("User not authorized to edit message");
            return res.status(403).json({ 
                success: false,
                message: "Not authorized to edit this message",
                code: "FORBIDDEN"
            });
        }

        msg.message = message.trim();
        await msg.save();

        console.log("Message edited successfully");
        res.status(200).json({
            success: true,
            message: "Message edited successfully",
            data: msg
        });
    } catch (error) {
        console.error("Error editing message:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR"
        });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        await connectDB();
        
        const { messageId } = req.params;
        const userId = req.auth?.userId;

        console.log("Delete message request:", { messageId, userId });

        if (!userId) {
            console.log("No userId found in request");
            return res.status(401).json({ message: "Authentication required" });
        }

        const msg = await Message.findById(messageId);
        
        if (!msg) {
            console.log("Message not found:", messageId);
            return res.status(404).json({ message: "Message not found" });
        }

        console.log("Message found:", { senderId: msg.senderId, userId });

        if (msg.senderId !== userId) {
            console.log("User not authorized to delete message");
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await Message.findByIdAndDelete(messageId);

        console.log("Message deleted successfully");
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Server error" });
    }
};