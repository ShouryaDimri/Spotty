import {Song} from "../models/songModel.js";
import {User} from "../models/userModel.js";
import {Album} from "../models/albumModel.js";

export const getStats = async(req, res) => {
    try {
        const [totalSongs, totalUsers, totalAlbums, uniqueArtists] = await Promise.all([
            Song.countDocuments(),
            User.countDocuments(),
            Album.countDocuments(),

            Song.aggregate([
                {
                    $group: {
                        _id: "$artist"
                    }
                },
                {
                    $count: "count"
                }
            ]),
        ]);
        res.status(200).json({ totalSongs, totalUsers, totalAlbums,  totalArtists: uniqueArtists[0]?.count || 0 });
               
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Server error" });
    }
}