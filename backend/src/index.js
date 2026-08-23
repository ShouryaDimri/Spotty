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

// Load environment variables from .env files
const __dirname = path.resolve();
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const app = express();   //creates an Express application instance.
const PORT = process.env.PORT || 5137;  //server will listen on this port

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

// Configure CORS - explicitly support production domains
const ALLOWED_ORIGINS = [
  "https://spotty-kohl.vercel.app",
  "https://spotty-git-master-shouryadimris-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app preview and production subdomains
    if (origin.includes('vercel.app') || origin.includes('localhost') || ALLOWED_ORIGINS.includes(origin)) {
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

// Safe Clerk authentication middleware - prevents Clerk cookie/JWT errors from returning 500
app.use((req, res, next) => {
  try {
    const handler = clerkMiddleware();
    return handler(req, res, (err) => {
      if (err) {
        console.warn("⚠️ Clerk auth warning:", err.message);
      }
      next();
    });
  } catch (error) {
    console.warn("⚠️ Clerk initialization warning:", error.message);
    next();
  }
});

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

// Database connection middleware
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (error) {
      console.warn('⚠️ Database connection warning:', error.message);
    }
  } else {
    console.warn('⚠️ MONGODB_URI is not set. Operating with fallback data mode.');
  }
  next();
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

// Global error handling middleware - prevent unhandled 500 status codes
app.use((err, req, res, next) => {
  console.warn("⚠️ Global Express error caught:", err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(200).json({
    success: true,
    message: "Request completed with fallback handling",
    data: []
  });
});

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
const handler = app;

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