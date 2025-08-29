import express from 'express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express'
import fileupload from 'express-fileupload';
import path from 'path';
import cors from 'cors';

import { connectDB } from './lib/db.js';  

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import statRoutes from './routes/statRoutes.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5137;
const __dirname = path.resolve();


app.use(cors({
  origin: "http://localhost:5173", // Frontend typically runs on 5173 with Vite
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

// Debug middleware for 404
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).send();
});

app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
  connectDB();
});
