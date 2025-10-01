# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Configuration
- [ ] Ensure all environment variables are set in Vercel dashboard:
  - `MONGODB_URI` - Your MongoDB connection string
  - `CLERK_SECRET_KEY` - Your Clerk secret key
  - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
  - `CLOUDINARY_API_KEY` - Your Cloudinary API key
  - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
  - `FRONTEND_URL` - Your frontend deployment URL (`https://spotty-kohl.vercel.app`)
  - `ADMIN_EMAIL` - Admin user email
  - `NODE_ENV` - Set to `production`

### Frontend Configuration
- [ ] Ensure all environment variables are set in Vercel dashboard:
  - `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
  - `VITE_API_BASE_URL` - Should be `/api` for Vercel deployment

## 🔧 Deployment Steps

### 1. Deploy Backend
```bash
# Navigate to backend directory
cd backend

# Deploy to Vercel
vercel --prod
```

### 2. Deploy Frontend
```bash
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod
```

## 🔍 Post-Deployment Verification

### Test API Endpoints
- [ ] Visit `https://your-backend-url.vercel.app/api/health` - Should return status OK
- [ ] Visit `https://your-backend-url.vercel.app/api/test` - Should return test message
- [ ] Test authentication flow through the frontend

### Test Frontend
- [ ] Visit your frontend URL
- [ ] Try signing in with Clerk
- [ ] Test music playback functionality
- [ ] Verify admin functionality (if using admin email)

## 🛠️ Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` is correctly set in backend environment variables
   - Check that the frontend URL matches exactly in CORS configuration

2. **API Connection Failed**:
   - Verify `VITE_API_BASE_URL` is set correctly in frontend (should be `/api` for Vercel)
   - Ensure backend is deployed and running

3. **Authentication Not Working**:
   - Check that Clerk keys are correct in both frontend and backend
   - Ensure domains are added to Clerk dashboard

4. **File Uploads Not Working**:
   - Verify Cloudinary credentials are correct
   - Check that Cloudinary account has sufficient quota

### Getting Help
If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure MongoDB and Cloudinary services are accessible
4. Contact support if needed

## ⚠️ Known Limitations

1. **Socket.io Functionality**:
   - Socket.io is disabled on Vercel due to serverless limitations
   - Real-time chat functionality will not work on Vercel
   - For full Socket.io support, consider alternative hosting (Railway, Render)

2. **Express v5 Compatibility**:
   - While Express v5 should work, there might be edge cases
   - If you encounter issues, consider downgrading to Express v4

## 🔄 Alternative Deployment Options

If you need full functionality including Socket.io, consider these platforms:
1. **Railway.app**
2. **Render.com**
3. **Heroku** (with limitations)
4. **DigitalOcean App Platform**

These platforms better support persistent connections required for Socket.io.