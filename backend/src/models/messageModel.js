import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId : {
        type : String,
        required : true
    },
    receiverId : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : false
    },
    fileUrl : {
        type : String,
        required : false
    },
    fileType : {
        type : String,
        required : false
    },
    fileName : {
        type : String,
        required : false
    },
    replyTo: {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: false
        },
        message: {
            type: String,
            required: false
        },
        senderName: {
            type: String,
            required: false
        }
    }
}, { timestamps : true });

export const Message = mongoose.model("Message", messageSchema); 