import {Song} from "../models/songModel.js";
import {User} from "../models/userModel.js";
import {Album} from "../models/albumModel.js";
import { connectDB } from "../lib/db.js";

export const getStats = async(req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        console.log("Fetching statistics...");
        
        const [totalSongs, totalUsers, totalAlbums, uniqueArtists] = await Promise.all([
            Song.countDocuments().catch(err => {
                console.error("Error counting songs:", err);
                return 0;
            }),
            User.countDocuments().catch(err => {
                console.error("Error counting users:", err);
                return 0;
            }),
            Album.countDocuments().catch(err => {
                console.error("Error counting albums:", err);
                return 0;
            }),
            Song.aggregate([
                {
                    $group: {
                        _id: "$artist"
                    }
                },
                {
                    $count: "count"
                }
            ]).catch(err => {
                console.error("Error counting artists:", err);
                return [{ count: 0 }];
            }),
        ]);
        
        const stats = {
            success: true,
            totalSongs: totalSongs || 0,
            totalUsers: totalUsers || 0,
            totalAlbums: totalAlbums || 0,
            totalArtists: uniqueArtists[0]?.count || 0
        };
        
        console.log("Statistics fetched successfully:", stats);
        res.status(200).json(stats);
               
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR",
            totalSongs: 0,
            totalUsers: 0,
            totalAlbums: 0,
            totalArtists: 0
        });
    }
}