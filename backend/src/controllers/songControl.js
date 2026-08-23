import { Song } from "../models/songModel.js";
import { connectDB } from "../lib/db.js";
import { FALLBACK_SONGS } from "../lib/fallbackData.js";

const getDefaultMusicLogo = () => {
    return '/cover-images/1.jpg';
};

export const getAllSongs = async(req, res) => {
    try {
        await connectDB();
        
        const songs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .limit(50)
            .sort({ createdAt: -1 });

        if (songs.length > 0) {
            const songsWithImages = songs.map(song => ({
                ...song.toObject(),
                imageUrl: song.imageUrl || getDefaultMusicLogo()
            }));
            return res.status(200).json({
                success: true,
                data: songsWithImages,
                count: songsWithImages.length
            });
        }
    } catch (error) {
        console.warn("Using fallback songs due to DB error:", error.message);
    }
    
    return res.status(200).json({
        success: true,
        data: FALLBACK_SONGS,
        count: FALLBACK_SONGS.length
    });
}

export const getFeaturedSongs = async(req, res) => {
    try {
        await connectDB();
        
        const realSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .sort({ createdAt: -1 })
            .limit(6);

        if (realSongs.length > 0) {
            const songsWithImages = realSongs.map(song => ({
                ...song.toObject(),
                imageUrl: song.imageUrl || getDefaultMusicLogo()
            }));
            return res.status(200).json(songsWithImages);
        }
    } catch (error) {
        console.warn("Using fallback featured songs due to DB error:", error.message);
    }
    
    return res.status(200).json(FALLBACK_SONGS.slice(0, 6));
};

export const getTrendingSongs = async(req, res) => {
    try {
        await connectDB();
        
        const realSongs = await Song.find({})
            .select('_id title artist imageUrl audioUrl duration')
            .sort({ createdAt: -1 })
            .limit(4);

        if (realSongs.length > 0) {
            const songsWithImages = realSongs.map(song => ({
                ...song.toObject(),
                imageUrl: song.imageUrl || getDefaultMusicLogo()
            }));
            return res.status(200).json(songsWithImages);
        }
    } catch (error) {
        console.warn("Using fallback trending songs due to DB error:", error.message);
    }
    
    return res.status(200).json(FALLBACK_SONGS.slice(2, 6));
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
            imageUrl: song.imageUrl || getDefaultMusicLogo()
        }));

        res.status(200).json(songsWithImages);
    } catch (error) {
        console.error("Error searching songs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Toggle like for a song
export const toggleLike = async (req, res) => {
    try {
        await connectDB();
        
        const { songId } = req.params;
        const userId = req.auth?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found"
            });
        }
        
        const isLiked = song.likedBy.includes(userId);
        
        if (isLiked) {
            // Unlike the song
            song.likedBy = song.likedBy.filter(id => id !== userId);
            song.likes = Math.max(0, song.likes - 1);
        } else {
            // Like the song
            song.likedBy.push(userId);
            song.likes += 1;
        }
        
        await song.save();
        
        res.status(200).json({
            success: true,
            data: {
                isLiked: !isLiked,
                likes: song.likes
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle like"
        });
    }
};

// Get liked songs for a user
export const getLikedSongs = async (req, res) => {
    try {
        await connectDB();
        
        const userId = req.auth?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        
        const songs = await Song.find({ likedBy: userId })
            .select('_id title artist imageUrl audioUrl duration likes')
            .sort({ createdAt: -1 });
        
        // Add default imageUrl for songs that don't have one
        const songsWithImages = songs.map(song => ({
            ...song.toObject(),
            imageUrl: song.imageUrl || getDefaultMusicLogo()
        }));
        
        res.status(200).json({
            success: true,
            data: songsWithImages
        });
    } catch (error) {
        console.error("Error fetching liked songs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch liked songs"
        });
    }
};