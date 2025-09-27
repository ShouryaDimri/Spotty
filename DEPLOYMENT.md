# Deployment Instructions

## Backend Deployment (Vercel)

1. **Deploy Backend to Vercel:**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project dashboard
   - Add these environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `CLERK_SECRET_KEY`: Your Clerk secret key  
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY`: Your Cloudinary API key
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
     - `FRONTEND_URL`: https://spotty-git-master-shouryadimris-projects.vercel.app

## Frontend Configuration Update

After backend is deployed, update the frontend environment variables in Vercel:

1. **Go to Vercel Dashboard > Your Frontend Project > Settings > Environment Variables**

2. **Add/Update these variables:**
   - `VITE_CLERK_PUBLISHABLE_KEY`: pk_test_bWF0dXJlLW9yY2EtODguY2xlcmsuYWNjb3VudHMuZGV2JA
   - `VITE_API_BASE_URL`: https://your-backend-deployment-url.vercel.app/api

3. **Redeploy frontend** after updating environment variables

## Alternative: Deploy Backend to Railway/Render

If Vercel doesn't work for your backend, consider:
- Railway.app
- Render.com
- Heroku (with credit card)

These platforms are better suited for Node.js backends with persistent connections.