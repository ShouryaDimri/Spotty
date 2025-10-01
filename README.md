# 🎵 Spotty - Music Streaming Platform

A full-stack music streaming application built with modern web technologies, featuring real-time chat, admin dashboard, and comprehensive music management.

## ✨ Features

- 🎧 **Music Streaming** - Play songs with full audio controls
- 🎵 **Album Management** - Browse and play complete albums
- 🔍 **Search Functionality** - Find songs, albums, and artists
- 💬 **Real-time Chat** - Chat with other users using Socket.io (requires alternative hosting)
- 👨‍💼 **Admin Dashboard** - Manage songs, albums, and users
- 🎨 **Modern UI** - Beautiful dark theme with responsive design
- 🔐 **Authentication** - Secure OAuth with Clerk
- ☁️ **File Storage** - Audio and image uploads via Cloudinary

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.io** - Real-time communication (requires alternative hosting for full support)
- **Clerk** - Authentication and user management
- **Cloudinary** - File storage and CDN

### Frontend
- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **Zustand** - State management
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Clerk account for authentication
- Cloudinary account for file storage

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd spotty
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (see [.env.example](backend/.env.example)):
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
ADMIN_EMAIL=your_admin_email@example.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5137
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory (see [.env.example](frontend/.env.example)):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5137/api
```

### 4. Database Seeding (Optional)
```bash
cd backend
npm run seed:songs
npm run seed:albums
```

### 5. Run the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5137

## 🎮 Usage

### For Regular Users:
1. **Sign Up/Login** - Use Google OAuth through Clerk
2. **Browse Music** - Explore featured songs and albums on the home page
3. **Search** - Find your favorite songs, albums, or artists
4. **Play Music** - Click on any song to start playing
5. **Chat** - Message other users in real-time (requires alternative hosting for full support)

### For Admins:
1. **Admin Access** - Available if your email matches `ADMIN_EMAIL` in the environment
2. **Dashboard** - View platform statistics and manage content
3. **Manage Songs** - Add/delete songs with audio file uploads
4. **Manage Albums** - Create/delete albums and organize songs

## 🎵 Audio Player Features

- ▶️ Play/Pause controls
- ⏭️ Next/Previous track navigation
- 🔊 Volume control
- 📊 Progress bar with seeking
- 🎚️ Queue management
- 📱 Responsive design

## 💬 Chat System

- Real-time messaging using Socket.io (requires alternative hosting for full support)
- User list with online status
- Message history
- Responsive chat interface

## 🔐 Authentication & Security

- OAuth integration with Google via Clerk
- Protected routes for authenticated users
- Admin-only endpoints for sensitive operations
- JWT token-based API authentication

## 📁 Project Structure

```
spotty/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── lib/           # Database & Cloudinary config
│   │   └── seeds/         # Sample data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── stores/        # Zustand state stores
│   │   ├── lib/          # Utilities and configs
│   │   └── types/        # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🎨 UI Components

The application uses shadcn/ui components for:
- Buttons and forms
- Cards and layouts
- Scroll areas
- Resizable panels
- Loading skeletons

## 🌐 API Endpoints

### Public Endpoints:
- `GET /api/songs/featured` - Get featured songs
- `GET /api/songs/trending` - Get trending songs
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID

### Protected Endpoints:
- `GET /api/users` - Get all users
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message

### Admin Endpoints:
- `GET /api/admin/check` - Check admin status
- `POST /api/admin/songs` - Add new song
- `DELETE /api/admin/songs/:id` - Delete song
- `POST /api/admin/albums` - Add new album
- `DELETE /api/admin/albums/:id` - Delete album

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is configured for direct deployment to Vercel:

1. **Frontend Deployment:**
   - Connect your GitHub repository to Vercel
   - Set environment variables as described in [DEPLOYMENT.md](DEPLOYMENT.md)
   - Deploy!

2. **Backend Deployment:**
   - Connect your GitHub repository to Vercel
   - Set environment variables as described in [DEPLOYMENT.md](DEPLOYMENT.md)
   - Deploy!
   - **Note**: Socket.io functionality will be disabled on Vercel due to serverless limitations

### Alternative Hosting for Full Socket.io Support

For full real-time chat functionality, deploy the backend to:
- Railway.app
- Render.com
- Heroku (with credit card)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@spotty.com or join our Discord server.

---

**Enjoy streaming music with Spotty! 🎵**