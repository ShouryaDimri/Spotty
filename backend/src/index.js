import express from 'express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express'
import fileupload from 'express-fileupload';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './lib/db.js';  

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import statRoutes from './routes/statRoutes.js';
import messageRoutes from './routes/messageRoutes.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5137;
const __dirname = path.resolve();

// Frontend URL for CORS - support both local and production
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173", "https://spotty-git-master-shouryadimris-projects.vercel.app"],
    credentials: true
  }
});


app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "https://spotty-git-master-shouryadimris-projects.vercel.app"],
  credentials: true,
}));
app.use(express.json()); // to parse JSON bodies

app.use(clerkMiddleware());
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  createParentPath: true,
limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit  
}));


// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/statistics", statRoutes);
app.use("/api/messages", messageRoutes);

// Socket.io connection handling
const onlineUsers = new Map(); // Store online users with their status

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    console.log(`User ${userId} joined room`);
  });

  socket.on('user_status', (data) => {
    const { userId, status } = data;
    onlineUsers.set(userId, {
      userId,
      status,
      socketId: socket.id,
      lastSeen: new Date()
    });
    
    // Broadcast status update to all clients
    io.emit('user_status_update', {
      userId,
      status,
      lastSeen: new Date()
    });
    
    // Send current online users list to the new user
    const onlineUsersList = Array.from(onlineUsers.values()).map(user => ({
      userId: user.userId,
      status: user.status,
      lastSeen: user.lastSeen
    }));
    socket.emit('online_users', onlineUsersList);
  });

  socket.on('user_song_update', (data) => {
    const { userId, song } = data;
    if (onlineUsers.has(userId)) {
      const user = onlineUsers.get(userId);
      user.currentSong = song;
      onlineUsers.set(userId, user);
      
      // Broadcast song update to all clients
      io.emit('user_song_update', { userId, song });
    }
  });

  socket.on('send_message', (data) => {
    // Broadcast message to receiver
    io.to(data.receiverId).emit('receive_message', {
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileName: data.fileName,
      createdAt: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove the disconnected user
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        onlineUsers.delete(userId);
        // Notify all clients about user disconnect
        io.emit('user_disconnected', userId);
        break;
      }
    }
  });
});

// Debug middleware for 404
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).send();
});

httpServer.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
  connectDB();
});
