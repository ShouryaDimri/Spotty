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

echo 🔧 Deployment Instructions:
echo.
echo Frontend can be deployed directly to Vercel:
echo 1. Push your code to GitHub
echo 2. Connect repository to Vercel
echo 3. Set environment variables as described in DEPLOYMENT.md
echo.
echo Backend can be deployed to Vercel with limitations:
echo 1. Socket.io functionality will be disabled
echo 2. REST API will work normally
echo.
echo For full Socket.io support, deploy backend to Railway or Render:
echo 1. Push your code to GitHub
echo 2. Connect repository to Railway/Render
echo 3. Set environment variables as described in DEPLOYMENT.md
echo.

echo 📋 Required Environment Variables:
echo.
echo Backend:
echo - MONGODB_URI
echo - CLERK_SECRET_KEY  
echo - CLOUDINARY_CLOUD_NAME
echo - CLOUDINARY_API_KEY
echo - CLOUDINARY_API_SECRET
echo - FRONTEND_URL
echo - ADMIN_EMAIL
echo.
echo Frontend:
echo - VITE_CLERK_PUBLISHABLE_KEY
echo - VITE_API_BASE_URL
echo.

pause