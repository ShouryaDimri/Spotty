import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Settings, Upload, User, ChevronDown, X, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButton from "./SignInOAuthButton.tsx";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";

const Topbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || ''
            });
        }
    }, [user]);

    const showBanner = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4000);
    };

    const handleProfileSave = async () => {
        try {
            setIsUpdatingProfile(true);
            if (user) {
                await user.update({
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName
                });
                await user.reload();
                showBanner('Profile updated successfully', 'success');
                setShowProfile(false);
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showBanner(error.message || 'Error updating profile. Please try again.', 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadForm.title || !uploadForm.artist || !uploadForm.audioFile) {
            showBanner('Please fill in all required fields', 'error');
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
            formData.append('duration', '0');

            const response = await axiosInstance.post('/admin/upload-song', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            const responseData = response.data as any;
            if (responseData?.success || response.status === 200) {
                showBanner(responseData.message || 'Song uploaded successfully!', 'success');
                setUploadForm({
                    title: '',
                    artist: '',
                    audioFile: null,
                    imageFile: null
                });
                setShowUpload(false);
            } else {
                throw new Error(responseData?.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Error uploading song:', error);
            let errorMessage = 'Upload failed. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            showBanner(errorMessage, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="sticky top-0 z-40 bg-[#121212] border-b border-[#282828] px-6 py-4 flex items-center justify-between">
            {/* Notification Banner */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium transition-all ${
                        notification.type === 'success' ? 'bg-[#1db954] text-black' :
                        notification.type === 'error' ? 'bg-[#e91429] text-white' :
                        'bg-[#282828] text-white'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            {/* App Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                    <Music2 className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                    Spotty
                </span>
            </Link>

            {/* Actions & Account */}
            <div className="flex items-center gap-4">
                <SignedIn>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded-full border border-white/10 transition-colors"
                        >
                            <img
                                src={user?.imageUrl || '/cover-images/1.jpg'}
                                alt="Profile"
                                className="w-7 h-7 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/cover-images/1.jpg';
                                }}
                            />
                            <span className="hidden md:inline text-sm font-medium">
                                {user?.firstName || 'User'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-52 bg-[#181818] border border-[#282828] rounded-lg shadow-2xl z-50 py-1 select-none">
                                <Link
                                    to="/admin"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#282828] hover:text-white transition-colors"
                                >
                                    <LayoutDashboardIcon className="h-4 w-4 text-zinc-400" />
                                    Admin Dashboard
                                </Link>

                                <button
                                    onClick={() => {
                                        setShowUpload(true);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#282828] hover:text-white transition-colors"
                                >
                                    <Upload className="h-4 w-4 text-zinc-400" />
                                    Upload Song
                                </button>

                                <button
                                    onClick={() => {
                                        setShowProfile(true);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#282828] hover:text-white transition-colors"
                                >
                                    <User className="h-4 w-4 text-zinc-400" />
                                    Edit Profile
                                </button>

                                <button
                                    onClick={() => {
                                        setShowSettings(true);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#282828] hover:text-white transition-colors"
                                >
                                    <Settings className="h-4 w-4 text-zinc-400" />
                                    Settings
                                </button>

                                <div className="border-t border-[#282828] my-1" />

                                <div className="px-4 py-2 text-sm text-zinc-300 hover:text-white">
                                    <SignOutButton />
                                </div>
                            </div>
                        )}
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInOAuthButton />
                </SignedOut>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="relative bg-[#181818] border border-[#282828] rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Streaming Audio Quality</label>
                                <select className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm focus:outline-none">
                                    <option>High (320 kbps)</option>
                                    <option>Normal (160 kbps)</option>
                                    <option>Low (96 kbps)</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    showBanner('Settings saved', 'success');
                                    setShowSettings(false);
                                }}
                                className="w-full py-2.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold rounded-full transition-colors text-sm"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="relative bg-[#181818] border border-[#282828] rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                            <button onClick={() => setShowProfile(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src={user?.imageUrl || '/cover-images/1.jpg'}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-[#1db954]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={profileForm.firstName}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#1db954]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={profileForm.lastName}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#1db954]"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowProfile(false)}
                                    className="flex-1 py-2 bg-[#282828] hover:bg-[#333333] text-white rounded-full text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProfileSave}
                                    disabled={!profileForm.firstName || isUpdatingProfile}
                                    className="flex-1 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="relative bg-[#181818] border border-[#282828] rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Upload a Song</h3>
                            <button onClick={() => setShowUpload(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleUploadSubmit(); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Song Title *</label>
                                <input
                                    type="text"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#1db954]"
                                    placeholder="e.g. Midnight City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Artist Name *</label>
                                <input
                                    type="text"
                                    value={uploadForm.artist}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#1db954]"
                                    placeholder="e.g. M83"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Audio File *</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, audioFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-[#1db954] file:text-black file:font-medium text-zinc-400 cursor-pointer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Cover Artwork (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 bg-[#282828] border border-white/10 rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-[#1db954] file:text-black file:font-medium text-zinc-400 cursor-pointer"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    className="flex-1 py-2 bg-[#282828] hover:bg-[#333333] text-white rounded-full text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Song'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topbar;