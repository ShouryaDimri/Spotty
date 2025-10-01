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