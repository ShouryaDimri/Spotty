import { Router } from "express";

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Spotty Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

export default router;