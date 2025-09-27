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
    }
}, { timestamps : true });

export const Message = mongoose.model("Message", messageSchema); 