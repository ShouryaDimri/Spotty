import {Song} from "../models/songModel.js";
import {Album} from "../models/albumModel.js";
import cloudinary from "../lib/cloudinary.js";
import { connectDB } from "../lib/db.js";

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
    console.log("🎵 Creating song with data:", {
        title: req.body.title,
        artist: req.body.artist,
        hasAudioFile: !!req.files?.audioFile,
        hasImageFile: !!req.files?.imageFile,
        files: req.files ? Object.keys(req.files) : 'No files',
        bodyKeys: Object.keys(req.body),
        fileKeys: req.files ? Object.keys(req.files) : 'No files object'
    });

    // Ensure database connection in serverless environment
    await connectDB();
    
    if (!req.files || !req.files.audioFile) {
      console.log("❌ No audio file found in request");
      console.log("Request files:", req.files);
      console.log("Request body:", req.body);
      return res.status(400).json({ message: "Audio file is required" });
    }
    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    console.log("📤 Uploading to Cloudinary...");
    const audioUrl = await uploadToCloudinary(audioFile);
    let imageUrl = '/cover-images/1.jpg'; // Default image
    
    if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
    }
    
    console.log("💾 Saving song to database...");
    const song = new Song({
        title,
        artist,
        audioUrl,
        imageUrl,
        albumId: albumId || null,
        duration: duration || 0,
    });
    await song.save()

    if(albumId){
        await Album.findByIdAndUpdate(albumId, {
            $push: {songs: song._id},
        });
    }
    
    console.log("✅ Song created successfully:", song._id);
    res.status(201).json(song);
  } catch (error) {
    console.error("❌ Error creating song:", error);
    res.status(500).json({ message: "Server error", error: error.message });
 }

};

export const deleteSong = async (req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
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
        // Ensure database connection in serverless environment
        await connectDB();
        
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
        // Ensure database connection in serverless environment
        await connectDB();
        
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
    res.status(200).json({admin: true}); 
};

export const testUpload = async (req, res) => {
    try {
        console.log("🧪 Test upload endpoint hit");
        console.log("📊 Request body:", req.body);
        console.log("📁 Request files:", req.files);
        console.log("📋 Headers:", req.headers);
        
        res.status(200).json({
            message: "Test upload endpoint working",
            hasFiles: !!req.files,
            fileCount: req.files ? Object.keys(req.files).length : 0,
            bodyKeys: Object.keys(req.body),
            contentType: req.headers['content-type'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Test upload error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const healthCheck = async (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Upload service is working",
        timestamp: new Date().toISOString()
    });
};