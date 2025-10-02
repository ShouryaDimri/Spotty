import express from 'express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express'
import fileupload from 'express-fileupload';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

import { connectDB } from './lib/db.js';  

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import statRoutes from './routes/statRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5137;
const __dirname = path.resolve();

// Frontend URL for CORS - support both local and production
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Create HTTP server
const httpServer = createServer(app);

// Only initialize Socket.io if we're not in a serverless environment
let io;
if (process.env.NOW_REGION) {
  // Running on Vercel - disable Socket.io or use a separate service
  console.log('Running on Vercel - Socket.io disabled for serverless compatibility');
} else {
  // Running locally or on traditional server
  io = new Server(httpServer, {
    cors: {
      origin: [
        FRONTEND_URL, 
        "http://localhost:5173", 
        "https://spotty-git-master-shouryadimris-projects.vercel.app",
        "https://spotty-kohl.vercel.app"
      ],
      credentials: true
    }
  });
}

// Configure CORS to allow all origins in production (Vercel creates many preview URLs)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://spotty-kohl.vercel.app",
    "https://spotty-git-master-shouryadimris-projects.vercel.app",
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json()); // to parse JSON bodies

app.use(clerkMiddleware());
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: process.env.NOW_REGION ? '/tmp' : path.join(__dirname, 'tmp'),
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Maximum 2 files (audio + image)
  }
}));

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log(`📊 Headers:`, req.headers);
  if (req.method === 'POST' && req.path.includes('/admin/songs')) {
    console.log(`🎵 Song upload request detected`);
    console.log(`📁 Content-Type:`, req.headers['content-type']);
    console.log(`📏 Content-Length:`, req.headers['content-length']);
  }
  next();
});

// API Routes - place these before static file serving to avoid conflicts
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/statistics", statRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", healthRoutes);

// Serve static files from frontend dist folder in production (only for non-serverless)
if (process.env.NODE_ENV === 'production' && !process.env.NOW_REGION) {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Check if frontend dist folder exists
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    // Handle React routing, return all requests to React app
    app.get('/*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }
}

// Add a root route to prevent 404 errors (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.status(200).json({ 
      message: 'Spotty Backend API is running!', 
      timestamp: new Date().toISOString(),
      environment: 'Development',
      availableEndpoints: [
        '/api/health',
        '/api/users',
        '/api/auth', 
        '/api/admin',
        '/api/songs',
        '/api/albums',
        '/api/statistics',
        '/api/messages'
      ]
    });
  });
}

// Debug middleware for 404
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      '/api/health',
      '/api/users',
      '/api/auth', 
      '/api/admin',
      '/api/songs',
      '/api/albums',
      '/api/statistics',
      '/api/messages'
    ]
  });
});

// Create handler for Vercel serverless functions
let handler = app; // Default to express app

// Only start server if not in serverless environment
// In serverless environment, Vercel will handle the server creation
if (!process.env.NOW_REGION) {
  // Connect to database and start server only in traditional environment
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log('Server is running on port:', PORT);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
  });
}

// Export for Vercel serverless functions
export default handler;