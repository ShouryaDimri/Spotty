import mongoose from "mongoose";


const albumSchema = new mongoose.Schema({ // Define Album schema
    title : {
        type : String,
        required : true
    },

    imageUrl : {
        type : String,
        required : true,
    },
    artist : {
        type : String,
        required : true
    },
    releaseYear: {
        type : Number,
        required : true
    },
    songs : [
        // This is part of a Mongoose schema. It defines a field called songs which is an array of ObjectId references to another model (the Song model).
        {
            //When you store ObjectId instead of full objects, you create relations between collections
            type : mongoose.Schema.Types.ObjectId, // Reference to Song model
            ref : "Song" //It enables .populate() later: Song details can be populated when querying Album
            //This replaces ObjectIds with actual song objects
            //To link related documents without duplicating data across collections.
            //Stores IDs of Song documents so they can be populated later.
        }
    ]
}, { timestamps : true});

export const Album = mongoose.model("Album", albumSchema); //Creates a Mongoose model named "Album" from albumSchema.