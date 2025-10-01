import express from 'express';
const router = express.Router();

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

export default router;