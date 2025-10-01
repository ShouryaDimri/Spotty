import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs/promises';

const execPromise = promisify(exec);
const __dirname = path.resolve();

async function buildFrontend() {
  try {
    console.log('Building frontend...');
    
    // Change to frontend directory and build
    const frontendDir = path.join(__dirname, '..', 'frontend');
    
    // Install frontend dependencies
    console.log('Installing frontend dependencies...');
    await execPromise('npm install', { cwd: frontendDir });
    
    // Build frontend
    console.log('Building frontend application...');
    await execPromise('npm run build', { cwd: frontendDir });
    
    console.log('Frontend built successfully!');
  } catch (error) {
    console.error('Error building frontend:', error);
    process.exit(1);
  }
}

buildFrontend();