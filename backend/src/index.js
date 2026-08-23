// Importing From Libraries
import express from 'express'; //Important
import dotenv from 'dotenv';  //Important
import { clerkMiddleware } from '@clerk/express'
import fileupload from 'express-fileupload';
import path from 'path';  //Important
import cors from 'cors';  //Important
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

// Importing From Lib folder for database connection
import { connectDB } from './lib/db.js';  

// Importing Routes for API Endpoints
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import statRoutes from './routes/statRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import userStatusRoutes from './routes/userStatusRoutes.js';

// to load environment variables from a .env file
dotenv.config();                               

const app = express();   //creates an Express application instance.
const PORT = process.env.PORT || 5137;  //server will listen on this port
const __dirname = path.resolve();  // Get current directory path

// Frontend URL for CORS - support both local and production
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";  // Default to localhost in development

// Create HTTP server
const httpServer = createServer(app);

// Only initialize Socket.io if we're not in a serverless environment
let io;
const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isServerless) {
  console.log('Running on Vercel - Socket.io disabled for serverless compatibility');
} else {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true
    }
  });
}

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow all requests in serverless or development
    if (!origin || isServerless || origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(clerkMiddleware());

// File upload middleware configuration
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: isServerless ? '/tmp' : path.join(__dirname, 'tmp'),
  createParentPath: true,
  limits: { 
    fileSize: 100 * 1024 * 1024,
    files: 2,
    fieldSize: 10 * 1024 * 1024
  }
}));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// Database connection middleware - ensure DB connection for every request
app.use(async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Database configuration missing. Please set MONGODB_URI in Vercel environment variables.'
      });
    }
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use("/api/users", userRoutes); // User management routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/admin", adminRoutes);   // Admin routes for permissions
app.use("/api/songs", songRoutes);  // Song management routes
app.use("/api/albums", albumRoutes);  // Album management routes
app.use("/api/statistics", statRoutes);  // Statistics routes
app.use("/api/messages", messageRoutes); // Messaging routes
app.use("/api/user-status", userStatusRoutes);  // User status routes
app.use("/api", healthRoutes);  // Health check routes

// Serve static files from frontend dist folder in production (only for non-serverless)
if (process.env.NODE_ENV === 'production' && !process.env.NOW_REGION) {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    app.get('/*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }
}

// Add a root route for backend verification (only in development)
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
        '/api/messages',
        '/api/user-status'
      ]
    });
  });
}

// 404 Handler for unmatched routes (MUST be registered after all routes)
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Create handler for Vercel serverless functions
if (!isServerless) {
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log('Server is running on port:', PORT);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
  });
}

export default handler;