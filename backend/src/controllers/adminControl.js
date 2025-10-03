import {Song} from "../models/songModel.js";
import {Album} from "../models/albumModel.js";
import cloudinary from "../lib/cloudinary.js";
import { connectDB } from "../lib/db.js";

// Function to get default music logo
const getDefaultMusicLogo = () => {
    // Using a music note icon from a CDN as default
    return 'https://cdn-icons-png.flaticon.com/512/174/174872.png';
};

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
    // Ensure database connection in serverless environment
    await connectDB();
    
    console.log("Creating song with data:", req.body);
    console.log("Files received:", req.files);
    console.log("Auth info:", req.auth);
    console.log("Headers:", req.headers);
    
    // Validate required fields
    if (!req.body.title || !req.body.artist) {
      return res.status(400).json({ 
        success: false,
        message: "Title and artist are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }
    
    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({ 
        success: false,
        message: "Audio file is required",
        code: "MISSING_AUDIO_FILE"
      });
    }
    
    // Validate file types
    const audioFile = req.files.audioFile;
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    if (!allowedAudioTypes.includes(audioFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audio file type. Supported formats: MP3, WAV, OGG, M4A",
        code: "INVALID_AUDIO_TYPE"
      });
    }
    
    const { title, artist, albumId, duration } = req.body;
    const imageFile = req.files.imageFile;

    // Validate image file if provided
    if (imageFile) {
      console.log("Image file details:", {
        name: imageFile.name,
        mimetype: imageFile.mimetype,
        size: imageFile.size
      });
      
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        console.log("Invalid image type:", imageFile.mimetype);
        return res.status(400).json({
          success: false,
          message: "Invalid image file type. Supported formats: JPEG, PNG, WEBP",
          code: "INVALID_IMAGE_TYPE"
        });
      }
    } else {
      console.log("No image file provided in request");
    }

    // Upload files to Cloudinary
    let audioUrl, imageUrl;
    try {
      console.log("Uploading audio file to Cloudinary...");
      audioUrl = await uploadToCloudinary(audioFile);
      console.log("Audio uploaded successfully:", audioUrl);
      
      if (imageFile) {
        console.log("Uploading image file to Cloudinary...");
        imageUrl = await uploadToCloudinary(imageFile);
        console.log("Image uploaded successfully:", imageUrl);
      } else {
        console.log("No image file provided, using default music logo");
        imageUrl = getDefaultMusicLogo();
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload files to cloud storage: " + uploadError.message,
        code: "UPLOAD_FAILED"
      });
    }
    
    // Create song record
    const song = new Song({
        title: title.trim(),
        artist: artist.trim(),
        audioUrl,
        imageUrl,
        albumId: albumId || null,
        duration: parseInt(duration) || 0,
    });
    
    await song.save();

    // Update album if provided
    if(albumId){
        try {
            await Album.findByIdAndUpdate(albumId, {
                $push: {songs: song._id},
            });
        } catch (albumError) {
            console.error("Error updating album:", albumError);
            // Don't fail the song creation if album update fails
        }
    }
    
    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: song
    });
  } catch (error) {
    console.error("Error creating song:", error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
        code: "VALIDATION_ERROR"
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Song with this title and artist already exists",
        code: "DUPLICATE_SONG"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      code: "INTERNAL_ERROR"
    });
 }

};

export const deleteSong = async (req, res) => {
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Song ID is required",
                code: "MISSING_SONG_ID"
            });
        }
        
        const song = await Song.findById(id);
        
        if (!song) {
            return res.status(404).json({ 
                success: false,
                message: "Song not found",
                code: "SONG_NOT_FOUND"
            });
        }

        // Remove song from album if it belongs to one
        if (song.albumId){
            try {
                await Album.findByIdAndUpdate(song.albumId, {
                    $pull: { songs: song._id }
                });
            } catch (albumError) {
                console.error("Error updating album:", albumError);
                // Continue with song deletion even if album update fails
            }
        }
        
        await Song.findByIdAndDelete(id);
        res.status(200).json({ 
            success: true,
            message: "Song deleted successfully"
        });
    
} catch (error) {
        console.error("Error deleting song:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR"
        });
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
    try {
        // Allow all authenticated users to upload songs
        res.status(200).json({ admin: true });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(200).json({ admin: true });
    }
};

export const testUpload = async (req, res) => {
    try {
        res.status(200).json({
            message: "Test upload endpoint working",
            hasFiles: !!req.files,
            fileCount: req.files ? Object.keys(req.files).length : 0,
            bodyKeys: Object.keys(req.body),
            contentType: req.headers['content-type'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Test upload error:", error);
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