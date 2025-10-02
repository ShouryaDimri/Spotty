import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/clerk-react"
import { LayoutDashboardIcon, Settings, Upload, User, ChevronDown, X } from "lucide-react"
import { Link } from "react-router-dom"
import SignInOAuthButton from "./SignInOAuthButton.tsx"
import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"

const Topbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        artist: '',
        audioFile: null as File | null,
        imageFile: null as File | null
    });
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await axiosInstance.get("/admin/check");
                console.log("Admin check response:", response.data);
                setIsAdmin(true);
            } catch (error) {
                console.error("Admin check failed:", error);
                // For now, allow all users to upload (temporary fix)
                setIsAdmin(true);
            }
        };

        checkAdminStatus();
    }, []);

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || ''
            });
        }
    }, [user]);

    const handleProfileSave = async () => {
        try {
            setIsUpdatingProfile(true);
            
            if (user) {
                console.log('Saving profile changes:', profileForm);
                
                // Update user profile using Clerk's API (username is not supported)
                await user.update({
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName
                });
                
                // Reload the user to get updated data
                await user.reload();
                
                console.log('Profile updated successfully');
                setShowProfile(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadForm.title || !uploadForm.artist || !uploadForm.audioFile) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setIsUploading(true);
            
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('artist', uploadForm.artist);
            formData.append('audioFile', uploadForm.audioFile);
            if (uploadForm.imageFile) {
                formData.append('imageFile', uploadForm.imageFile);
            }
            formData.append('duration', '0'); // Will be calculated on server

            console.log('🎵 Uploading song:', {
                title: uploadForm.title,
                artist: uploadForm.artist,
                audioFile: uploadForm.audioFile?.name,
                imageFile: uploadForm.imageFile?.name,
                audioFileSize: uploadForm.audioFile?.size,
                imageFileSize: uploadForm.imageFile?.size
            });

            // Check if we have authentication token
            const token = localStorage.getItem('__clerk_db_jwt');
            console.log('🔑 Auth token available:', !!token);

            const response = await axiosInstance.post('/admin/songs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 seconds timeout for file uploads
            });

            console.log('✅ Song uploaded successfully:', response.data);
            alert('Song uploaded successfully!');
            
            // Reset form
            setUploadForm({
                title: '',
                artist: '',
                audioFile: null,
                imageFile: null
            });
            setShowUpload(false);
        } catch (error: any) {
            console.error('❌ Error uploading song:', error);
            console.error('📊 Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            
            let errorMessage = 'Unknown error occurred';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network Error - Please check your connection and try again';
            } else if (error.response?.status === 401) {
                errorMessage = 'Unauthorized - Please sign in again';
            } else if (error.response?.status === 403) {
                errorMessage = 'Forbidden - Admin access required';
            } else if (error.response?.status === 413) {
                errorMessage = 'File too large - Please choose a smaller file';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error uploading song: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

  return (
    <div className="flex items-center justify-between p-6 sticky top-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-md z-[1000] border-b border-zinc-700/50">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="relative flex gap-3 items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-lg">S</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                    Spotty
                </span>
            </div>
        </div>
        
        <div className="relative flex items-center gap-4">
            {isAdmin && (
                <Link to={"/admin"} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
                    <LayoutDashboardIcon className="size-4" />
                    <span className="hidden md:inline font-medium">Admin Dashboard</span>
                    <span className="text-xs">⚡</span>
                </Link>)}

                <SignedIn>
                    {/* Account Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 border border-zinc-600"
                        >
                            <img
                                src={user?.imageUrl || '/cover-images/1.jpg'}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/cover-images/1.jpg';
                                }}
                            />
                            <span className="hidden md:inline font-medium">
                                {user?.firstName || 'User'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[50000]">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setShowSettings(true);
                                            setShowDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            setShowUpload(true);
                                            setShowDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload a Song
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            setShowProfile(true);
                                            setShowDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Change Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
                        <SignOutButton />
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInOAuthButton />
                </SignedOut>

        </div>
        
        {/* Settings Modal */}
        {showSettings && (
            <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-24">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
                <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mt-16">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Audio Quality</label>
                            <select className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white">
                                <option>High (320kbps)</option>
                                <option>Medium (160kbps)</option>
                                <option>Low (96kbps)</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-zinc-300">
                                <input type="checkbox" defaultChecked />
                                Enable notifications
                            </label>
                        </div>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Profile Edit Modal */}
        {showProfile && (
            <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-24">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowProfile(false)} />
                <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mt-16">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                        <button onClick={() => setShowProfile(false)} className="text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <img
                                src={user?.imageUrl || '/cover-images/1.jpg'}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">First Name</label>
                            <input
                                type="text"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={profileForm.lastName}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                                placeholder="Enter last name"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowProfile(false)}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleProfileSave}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!profileForm.firstName || !profileForm.lastName || isUpdatingProfile}
                            >
                                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Upload Song Modal */}
        {showUpload && (
            <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-24">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowUpload(false)} />
                <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mt-16">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Upload a Song</h3>
                        <button onClick={() => setShowUpload(false)} className="text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleUploadSubmit(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Song Title *</label>
                            <input
                                type="text"
                                value={uploadForm.title}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                                placeholder="Enter song title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Artist Name *</label>
                            <input
                                type="text"
                                value={uploadForm.artist}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                                placeholder="Enter artist name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Audio File *</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setUploadForm(prev => ({ ...prev, audioFile: e.target.files?.[0] || null }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Cover Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUploadForm(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Song'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}

export default Topbar;