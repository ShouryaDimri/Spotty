import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title : {
        type: String,
        required : true
    },
    artist : {
        type : String,
        required : true
    },
    audioUrl : {
        type : String,
        required : true,
        unique : true
    },
    imageUrl : {
        type : String,
        required : false,
        default : '/cover-images/1.jpg'
    },
    duration : {
        type: Number,
        required : true
    },
    albumId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required : false
    }
}, { timestamps : true }
);


export const Song = mongoose.model("Song", songSchema);