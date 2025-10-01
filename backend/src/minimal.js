import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Minimal app working' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;