import {Song} from "../models/songModel.js";
import {Album} from "../models/albumModel.js";
import cloudinary from "../lib/cloudinary.js";
import { connectDB } from "../lib/db.js";

// Function to get default music logo
const getDefaultMusicLogo = () => {
    // Using a music note icon from a CDN as default
    return 'https://cdn-icons-png.flaticon.com/512/174/174872.png';
};

//Cloud platform to upload, store, transform, and deliver media files.
const uploadToCloudinary = async (file) => { // Upload file to Cloudinary
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
    if (!req.body.title || !req.body.artist) { // Title and artist are required
      return res.status(400).json({ // Bad Request
        success: false, 
        message: "Title and artist are required",
        code: "MISSING_REQUIRED_FIELDS"
        // Missing title or artist in request body
      });
    }
    
    if (!req.files || !req.files.audioFile) { // Audio file is required
      return res.status(400).json({  // Bad Request
        success: false,
        message: "Audio file is required",
        code: "MISSING_AUDIO_FILE"
        // No audio file uploaded in request
      });
    }
    
    // Validate file types
    const audioFile = req.files.audioFile;//audioFile is the uploaded file sent in the request. Extracts the uploaded audio file from the incoming request object.
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']; // Supported audio MIME types
    if (!allowedAudioTypes.includes(audioFile.mimetype)) {
      return res.status(400).json({ // Bad Request
        success: false,
        message: "Invalid audio file type. Supported formats: MP3, WAV, OGG, M4A",
        code: "INVALID_AUDIO_TYPE"
        // Uploaded audio file has unsupported MIME type
      });
    }
    
    const { title, artist, albumId, duration } = req.body; // Destructure song details from request body
    const imageFile = req.files.imageFile; // Optional image file

    // Validate image file if provided
    if (imageFile) {
      console.log("Image file details:", { //Prints name, type, and size of the uploaded image file.
        name: imageFile.name,
        mimetype: imageFile.mimetype, // MIME type of the image file
        size: imageFile.size
      });
      
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(imageFile.mimetype //That line checks if the uploaded image’s MIME type is allowed.
        )) {
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
      console.log("Uploading audio file to Cloudinary...", {
        name: audioFile.name,
        size: audioFile.size,
        mimetype: audioFile.mimetype
      });
      audioUrl = await uploadToCloudinary(audioFile); // Upload audio file to Cloudinary
      console.log("Audio uploaded successfully:", audioUrl);
      
      if (imageFile) {
        console.log("Uploading image file to Cloudinary...", {
          name: imageFile.name,
          size: imageFile.size,
          mimetype: imageFile.mimetype
        });
        imageUrl = await uploadToCloudinary(imageFile); // Upload image file to Cloudinary
        console.log("Image uploaded successfully:", imageUrl);
      } else {
        console.log("No image file provided, using default music logo");
        imageUrl = getDefaultMusicLogo(); // Use default image if none provided
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", {
        error: uploadError.message, // Log error message
        stack: uploadError.stack,
        audioFile: audioFile ? { name: audioFile.name, size: audioFile.size } : null,
        imageFile: imageFile ? { name: imageFile.name, size: imageFile.size } : null
      });
      return res.status(500).json({
        success: false,
        message: "Failed to upload files to cloud storage: " + uploadError.message,
        code: "UPLOAD_FAILED",
        details: {
          audioFileSize: audioFile?.size,
          imageFileSize: imageFile?.size,
          error: uploadError.message
          // Detailed error info for debugging
        }
      });
    }
    
    // Create song record
    console.log("Creating song record with data:", {
      // Trim whitespace from title and artist
      title: title.trim(),
      artist: artist.trim(),
      audioUrl,
      imageUrl,
      albumId: albumId || null,
      duration: parseInt(duration) || 0, // Convert duration to integer or default to 0
    });
    
    const song = new Song({ // Create new Song document
        title: title.trim(),
        artist: artist.trim(),
        audioUrl,
        imageUrl,
        albumId: albumId || null,
        duration: parseInt(duration) || 0,
    });
    
    await song.save(); // Save song to database
    console.log("Song saved successfully with ID:", song._id);

    // Update album if provided
    if(albumId){
        try {
            await Album.findByIdAndUpdate(albumId, // Add song to album's songs array
              {
                $push: {songs: song._id}, // Push new song ID to songs array
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

export const deleteSong = async (req, res) => { // Delete a song by ID
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const { id } = req.params; // Get song ID from request parameters
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Song ID is required",
                code: "MISSING_SONG_ID"
            });
        }
        
        const song = await Song.findById(id); // Find song by ID
        
        if (!song) {
          // Song not found
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
                    $pull: { songs: song._id } // Remove song ID from album's songs array
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
  // Create a new album
    try {
        // Ensure database connection in serverless environment
        await connectDB();
        
        const {title, artist, releaseYear} = req.body; // Destructure album details from request body
        const {imageFile} = req.files; // Get image file from uploaded files
        
        if (!imageFile) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const imageUrl = await uploadToCloudinary(imageFile); // Upload image to Cloudinary

        const album = new Album({
          // Create new Album document
            title,
            artist,
            imageUrl,
            releaseYear,
        });
        await album.save(); // Save album to database
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
        
        const { id } = req.params; // Get album ID from request parameters
        await Song.deleteMany({ albumId: id });   // Delete all songs associated with the album
        await Album.findByIdAndDelete(id); // Delete the album itself
        res.status(200).json({ message: "Album and associated songs deleted successfully" });
    } catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSongs = async (req, res) => {
  // Get all songs for admin panel
  try {
    await connectDB();
    
    const songs = await Song.find({}) // Fetch all songs
      .select('_id title artist imageUrl audioUrl duration likes likedBy playCount createdAt') // Select specific fields
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Add default imageUrl for songs that don't have one
    const songsWithImages = songs.map(song => ({ // Map over songs to ensure imageUrl is set
      ...song.toObject(), // Convert Mongoose document to plain object, turns the Mongoose doc into a normal JS object
      imageUrl: song.imageUrl || getDefaultMusicLogo() //Ensures clean JSON output and guarantees an image even if missing
    }));
    
    res.status(200).json({
      // Return songs with success status
      success: true,
      data: songsWithImages,
      count: songsWithImages.length // Number of songs returned
    });
  } catch (error) {
    console.error("Error fetching songs for admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const checkAdmin = async (req, res) => {
  // Check if user is admin (for upload permissions)
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
          // Test upload endpoint response
            message: "Test upload endpoint working", // Confirmation message
            hasFiles: !!req.files, // Whether files were uploaded
            fileCount: req.files ? Object.keys(req.files).length : 0, // Number of files uploaded
            bodyKeys: Object.keys(req.body), // Keys in request body
            contentType: req.headers['content-type'], // Content-Type header
            timestamp: new Date().toISOString() // Current timestamp
        });
    } catch (error) {
        console.error("Test upload error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const healthCheck = async (req, res) => { // Health check endpoint
    res.status(200).json({
        status: "OK",
        message: "Upload service is working",
        timestamp: new Date().toISOString() // Current server time
    });
};