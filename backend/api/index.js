import { createRequestHandler } from '@vercel/node';
import app from '../src/index.js';

export default createRequestHandler(app);