# 🚀 Deployment Instructions

## 🎯 Overview

This project can be deployed to Vercel with the following considerations:

1. **Frontend**: Can be deployed directly to Vercel (React + Vite)
2. **Backend**: Can be deployed to Vercel, but with limitations:
   - Socket.io functionality will be disabled (Vercel serverless limitation)
   - REST API endpoints will work normally
   - For full Socket.io support, consider alternative hosting (Railway, Render)

## 📦 Backend Deployment (Vercel)

### 1. Deploy Backend to Vercel:
```bash
cd backend
vercel --prod
```

### 2. Set Environment Variables in Vercel Dashboard:
Go to your Vercel project dashboard and add these environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://...` |
| `CLERK_SECRET_KEY` | Your Clerk secret key | `sk_test_...` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `your_api_secret` |
| `FRONTEND_URL` | Your frontend deployment URL | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Admin user email | `admin@example.com` |

### 3. Configure CORS Origins (Optional)
If you have additional domains, update the CORS configuration in [backend/src/index.js](backend/src/index.js)

## 🖥️ Frontend Configuration

### 1. Set Environment Variables in Vercel Dashboard:
Go to your frontend Vercel project dashboard and add these environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key | `pk_test_...` |
| `VITE_API_BASE_URL` | Your backend API URL | `https://your-backend.vercel.app/api` |

### 2. Redeploy Frontend
After setting environment variables, redeploy your frontend for changes to take effect.

## 🔄 Alternative: Full Socket.io Support

If you need full Socket.io functionality (real-time chat), consider deploying the backend to platforms better suited for persistent connections:

### Railway.app
1. Connect your GitHub repository
2. Set the same environment variables as above
3. Set build command to `npm install`
4. Set start command to `npm start`

### Render.com
1. Create a new Web Service
2. Connect your GitHub repository
3. Set environment variables
4. Set build command to `npm install`
5. Set start command to `npm start`

## 🧪 Testing Your Deployment

1. Visit your frontend URL
2. Try signing in with Clerk
3. Test music playback functionality
4. Verify admin functionality (if using admin email)
5. Note: Real-time chat will only work with alternative hosting

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Ensure `FRONTEND_URL` is correctly set in backend environment variables
   - Check that the frontend URL matches exactly

2. **API Connection Failed**:
   - Verify `VITE_API_BASE_URL` is set correctly in frontend
   - Ensure backend is deployed and running

3. **Authentication Not Working**:
   - Check that Clerk keys are correct in both frontend and backend
   - Ensure domains are added to Clerk dashboard

4. **File Uploads Not Working**:
   - Verify Cloudinary credentials are correct
   - Check that Cloudinary account has sufficient quota

### Getting Help:
If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure MongoDB and Cloudinary services are accessible
4. Contact support if needed