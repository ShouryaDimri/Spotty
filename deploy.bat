@echo off
echo 🚀 Spotty Deployment Script
echo.

echo 📦 Building Frontend...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend built successfully!
echo.

echo 🔧 Please deploy backend manually:
echo.
echo 1. cd backend
echo 2. vercel --prod
echo 3. Copy the deployment URL
echo 4. Update VITE_API_BASE_URL in Vercel dashboard
echo 5. Redeploy frontend
echo.

echo 📋 Environment Variables needed for backend:
echo - MONGODB_URI
echo - CLERK_SECRET_KEY  
echo - CLOUDINARY_CLOUD_NAME
echo - CLOUDINARY_API_KEY
echo - CLOUDINARY_API_SECRET
echo - FRONTEND_URL=https://spotty-git-master-shouryadimris-projects.vercel.app
echo.

pause