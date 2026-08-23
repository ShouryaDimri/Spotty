import { Album } from "../models/albumModel.js";
import { connectDB } from "../lib/db.js";
import { FALLBACK_ALBUMS } from "../lib/fallbackData.js";

export const getAlbums = async(req, res) => {
    try {
        await connectDB();
        const albums = await Album.find();
        if (albums.length > 0) {
            return res.status(200).json(albums);
        }
    } catch (error) {
        console.warn("Using fallback albums due to DB error:", error.message);
    }
    return res.status(200).json(FALLBACK_ALBUMS);
};

export const getAllAlbums = async(req, res) => {
    try {
        await connectDB();
        
        const albums = await Album.find({})
            .select('_id title artist imageUrl releaseYear songs')
            .limit(50)
            .sort({ createdAt: -1 });

        if (albums.length > 0) {
            return res.status(200).json({
                success: true,
                data: albums,
                count: albums.length
            });
        }
    } catch (error) {
        console.warn("Using fallback all albums due to DB error:", error.message);
    }
    
    return res.status(200).json({
        success: true,
        data: FALLBACK_ALBUMS,
        count: FALLBACK_ALBUMS.length
    });
};

export const getAlbumById = async(req, res) => {
    try {
        await connectDB();
        
        const { albumId } = req.params;
        const album = await Album.findById(albumId).populate('songs');
        if (album) {
            return res.status(200).json(album);
        }
    } catch (error) {
        console.warn("Error fetching album by ID:", error.message);
    }
    
    const fallback = FALLBACK_ALBUMS.find(a => a._id === req.params.albumId) || FALLBACK_ALBUMS[0];
    return res.status(200).json(fallback);
};

export const searchAlbums = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: "Query parameter is required" });
        }

        const albums = await Album.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { artist: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        res.status(200).json(albums);
    } catch (error) {
        console.error("Error searching albums:", error);
        res.status(500).json({ message: "Server error" });
    }
};