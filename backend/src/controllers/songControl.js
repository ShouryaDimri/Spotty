import { Song } from "../models/songModel.js";
import { connectDB } from "../lib/db.js";

export const getAllSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        console.log("Fetching all songs...");
        
        // Use find instead of aggregate for better compatibility
        const songs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .limit(50)
            .sort({ createdAt: -1 });

        // Add default imageUrl for songs that don't have one
        const songsWithImages = songs.map(song => ({
            ...song.toObject(),
            imageUrl: song.imageUrl || '/cover-images/1.jpg'
        }));

        console.log(`Found ${songsWithImages.length} songs`);
        res.status(200).json({
            success: true,
            data: songsWithImages,
            count: songsWithImages.length
        });    
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR",
            data: []
        });
    }
}

export const getFeaturedSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        // Only fetch real uploaded songs from database - NO DUMMY DATA
        const realSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .sort({ createdAt: -1 }) // Get newest songs first
            .limit(6);

        // Add default imageUrl for songs that don't have one
        const songsWithImages = realSongs.map(song => ({
            ...song.toObject(),
            imageUrl: song.imageUrl || '/cover-images/1.jpg'
        }));

        console.log(`Found ${songsWithImages.length} real songs for featured`);

        res.status(200).json(songsWithImages);    
    } catch (error) {
        console.error("Error fetching featured songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTrendingSongs = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        console.log("Fetching trending songs...");
        
        // Only fetch real uploaded songs from database - NO DUMMY DATA
        const realSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .sort({ createdAt: -1 }) // Get newest songs first
            .limit(4);

        // Add default imageUrl for songs that don't have one
        const songsWithImages = realSongs.map(song => ({
            ...song.toObject(),
            imageUrl: song.imageUrl || '/cover-images/1.jpg'
        }));

        console.log(`Found ${songsWithImages.length} real songs for trending:`, songsWithImages.map(s => s.title));

        res.status(200).json(songsWithImages);    
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

        // Add default imageUrl for songs that don't have one
        const songsWithImages = songs.map(song => ({
            ...song.toObject(),
            imageUrl: song.imageUrl || '/cover-images/1.jpg'
        }));

        res.status(200).json(songsWithImages);
    } catch (error) {
        console.error("Error searching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};