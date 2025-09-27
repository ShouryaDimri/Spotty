import {Song} from "../models/songModel.js";
import {Album} from "../models/albumModel.js";
import cloudinary from "../lib/cloudinary.js";


const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto" // Cloudinary uses 'video' for audio files
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload file");
    }
}

export const createSong = async (req, res) => {
   try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({ message: "Audio file and image file are required" });
    }
    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);
    const song = new Song({
        title,
        artist,
        audioUrl,
        imageUrl,
        albumId: albumId || null,
        duration,
    });
    await song.save()

    if(albumId){
        await Album.findByIdAndUpdate(albumId, {
            $push: {songs: song._id},
        });
    }
    res.status(201).json(song);
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ message: "Server error", error });
 }

};

export const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);

        if (song.albumId){
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id }
            });
        }
        await Song.findByIdAndDelete(id);
        res.status(200).json({ message: "Song deleted successfully" });
    
} catch (error) {
        console.error("Error deleting song:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createAlbum = async (req, res) => {
    try {
        const {title, artist, releaseYear} = req.body;
        const {imageFile} = req.files;
        
        if (!imageFile) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const imageUrl = await uploadToCloudinary(imageFile);

        const album = new Album({
            title,
            artist,
            imageUrl,
            releaseYear,
        });
        await album.save();
        res.status(201).json(album);
    } catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);
        res.status(200).json({ message: "Album and associated songs deleted successfully" });
    } catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const checkAdmin = async (req, res) => {
    res.status(200).json({admin: true}); };
