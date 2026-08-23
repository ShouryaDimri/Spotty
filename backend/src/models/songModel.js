import mongoose from "mongoose";

const songSchema = new mongoose.Schema({ // Define Song schema
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
        required : false
    },
    duration : {
        type: Number,
        required : true
    },
    albumId : {
        type: mongoose.Schema.Types.ObjectId, //A field that stores the ObjectId of an Album document.
        ref: 'Album', //Enables linking to Album so data stays connected and normalized. Holds an Album document's ObjectId as a reference field.
        required : false
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: String // Clerk user ID
    }],
    playCount: {
        type: Number,
        default: 0
    }
}, { timestamps : true }
);
// createdAt, updatedAt

export const Song = mongoose.model("Song", songSchema);