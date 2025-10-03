import {Album} from "../models/albumModel.js";
import { connectDB } from "../lib/db.js";

export const getAlbums = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const albums = await Album.find();
        res.status(200).json(albums);    
    } catch (error) {
        console.error("Error fetching albums:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllAlbums = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        console.log("Fetching all albums...");
        
        const albums = await Album.find({})
            .select('_id title artist imageUrl releaseYear songs')
            .limit(50)
            .sort({ createdAt: -1 });

        console.log(`Found ${albums.length} albums`);
        res.status(200).json({
            success: true,
            data: albums,
            count: albums.length
        });    
    } catch (error) {
        console.error("Error fetching all albums:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR",
            data: []
        });
    }
};

export const getAlbumById = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { albumId } = req.params;
        const album = await Album.findById(albumId).populate('songs');
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json(album);

    } catch (error) {
        console.error("Error fetching album by ID:", error);
        res.status(500).json({ message: "Server error" });
    }

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