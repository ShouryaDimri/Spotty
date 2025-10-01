// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Dynamic import to support ES Modules in serverless environment
  const { default: app } = await import('../backend/src/index.js');
  
  // Return the Express app handler
  return app(req, res);
}

