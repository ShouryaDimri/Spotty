import { Song } from "../models/songModel.js";

export const getAllSongs = async(req, res) => {
    try {
        const songs = await Song.aggregate(                        // fetch top 6 songs from mongoDB
            { $sample: { size: 6 } } ,
            { $project: {
                _id:1,
                title:1,
                artist:1,
                imageUrl:1,
                audioUrl:1,
            }}
        );


        res.status(200).json(songs);    
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getFeaturedSongs = async(req, res) => {
    try {
        const songs = await Song.aggregate(                        // fetch top 6 songs from mongoDB
            { $sample: { size: 4 } } ,
            { $project: {
                _id:1,
                title:1,
                artist:1,
                imageUrl:1,
                audioUrl:1,
            }}
        );


        res.status(200).json(songs);    
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTrendingSongs = async(req, res) => {
    try {
        const songs = await Song.aggregate(                        // fetch top 6 songs from mongoDB
            { $sample: { size: 4 } } ,
            { $project: {
                _id:1,
                title:1,
                artist:1,
                imageUrl:1,
                audioUrl:1,
            }}
        );


        res.status(200).json(songs);    
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};
