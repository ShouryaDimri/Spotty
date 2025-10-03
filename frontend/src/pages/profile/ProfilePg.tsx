import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Calendar, Music, Disc, ArrowLeft } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  songs?: any[];
  albums?: any[];
}

const ProfilePg = () => {
  const { user: currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "songs" | "albums">("overview");

  // Get user data from navigation state or current user
  const targetUser = location.state?.user || currentUser;
  const isOwnProfile = !location.state?.user;

  useEffect(() => {
    if (targetUser) {
      setProfile({
        _id: targetUser._id || targetUser.id,
        firstName: targetUser.firstName || targetUser.first_name || 'User',
        lastName: targetUser.lastName || targetUser.last_name || '',
        email: targetUser.emailAddresses?.[0]?.emailAddress || targetUser.email || '',
        imageUrl: targetUser.imageUrl || targetUser.image_url || '/cover-images/1.jpg',
        createdAt: targetUser.createdAt || new Date().toISOString(),
        songs: [],
        albums: []
      });
    }
    setIsLoading(false);
  }, [targetUser]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
          <p className="text-zinc-400 mb-4">The requested profile could not be found.</p>
          <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-500">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white">
          {isOwnProfile ? 'My Profile' : `${profile.firstName}'s Profile`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img
                  src={profile.imageUrl}
                  alt={profile.firstName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
                />
              </div>
              <CardTitle className="text-white text-xl">
                {profile.firstName} {profile.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              {isOwnProfile && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-500"
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className="text-white"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "songs" ? "default" : "ghost"}
              onClick={() => setActiveTab("songs")}
              className="text-white"
            >
              Songs
            </Button>
            <Button
              variant={activeTab === "albums" ? "default" : "ghost"}
              onClick={() => setActiveTab("albums")}
              className="text-white"
            >
              Albums
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300">
                      {isOwnProfile 
                        ? "Welcome to your profile! Here you can manage your music and view your activity."
                        : `This is ${profile.firstName}'s profile. View their music collection and activity.`
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">0</div>
                        <div className="text-sm text-zinc-400">Songs Uploaded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">0</div>
                        <div className="text-sm text-zinc-400">Albums Created</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "songs" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Songs</h3>
                <div className="text-center py-8 text-zinc-400">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No songs uploaded yet</p>
                </div>
              </div>
            )}

            {activeTab === "albums" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Albums</h3>
                <div className="text-center py-8 text-zinc-400">
                  <Disc className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No albums created yet</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ProfilePg;
