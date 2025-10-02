import { Song } from "../models/songModel.js";
import { connectDB } from "../lib/db.js";

export const getAllSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
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
        // Ensure database connection in serverless environment
        await connectDB();
        
        // Add 3 dummy songs for "Made For You" section
        const dummySongs = [
            {
                _id: "dummy_featured_1",
                title: "Midnight Memories",
                artist: "Luna Eclipse",
                imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 180
            },
            {
                _id: "dummy_featured_2",
                title: "Electric Dreams",
                artist: "Neon Pulse",
                imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 210
            },
            {
                _id: "dummy_featured_3",
                title: "Ocean Breeze",
                artist: "Coastal Vibes",
                imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 195
            }
        ];

        // Try to fetch from database first - get newest uploaded songs
        const dbSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .limit(6)
            .sort({ createdAt: -1 }); // Get newest songs first

        // Combine real songs with dummy songs (prioritize real songs)
        const allSongs = [...dbSongs, ...dummySongs].slice(0, 6);
        res.status(200).json(allSongs);    
    } catch (error) {
        console.error("Error fetching featured songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTrendingSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        // Add 4 dummy songs for "Trending Now" section
        const dummySongs = [
            {
                _id: "dummy_trending_1",
                title: "Viral Vibes",
                artist: "TikTok Stars",
                imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 165
            },
            {
                _id: "dummy_trending_2",
                title: "Summer Heat",
                artist: "Beach Waves",
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 220
            },
            {
                _id: "dummy_trending_3",
                title: "City Lights",
                artist: "Urban Soul",
                imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 190
            },
            {
                _id: "dummy_trending_4",
                title: "Retro Nights",
                artist: "Synthwave Collective",
                imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop&crop=faces",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                duration: 240
            }
        ];

        // Try to fetch from database first - get uploaded songs
        const dbSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .limit(4)
            .sort({ createdAt: -1 }); // Get newest songs first

        // Combine real songs with dummy songs (prioritize real songs)
        const allSongs = [...dbSongs, ...dummySongs].slice(0, 4);
        res.status(200).json(allSongs);    
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const searchSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: "Query parameter is required" });
        }

        const songs = await Song.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { artist: { $regex: q, $options: 'i' } }
            ]
        }).select({
            _id: 1,
            title: 1,
            artist: 1,
            imageUrl: 1,
            audioUrl: 1,
            duration: 1
        }).limit(20);

        res.status(200).json(songs);
    } catch (error) {
        console.error("Error searching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};