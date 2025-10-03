import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, MessageCircle, User } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  fullName: string;
  imageUrl: string;
  clerkId: string;
}

interface OnlineUser {
  userId: string;
  status: 'online' | 'idle' | 'offline';
  lastSeen?: Date;
  currentSong?: {
    title: string;
    artist: string;
    imageUrl: string;
  };
}

const FriendsActivity = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [, setSocket] = useState<Socket | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize socket in development (Socket.io not available in Vercel serverless)
    if (import.meta.env.DEV) {
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5137";
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      if (user?.id) {
        newSocket.emit("join_room", user.id);
        // Set current user as online
        newSocket.emit("user_status", { userId: user.id, status: 'online' });
      }

      // Listen for current song updates
      newSocket.on("user_song_update", (data: { userId: string; song: any }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          if (updated.has(data.userId)) {
            updated.set(data.userId, {
              ...updated.get(data.userId)!,
              currentSong: data.song
            });
          }
          return updated;
        });
      });

      // Listen for user status updates
      newSocket.on("user_status_update", (data: OnlineUser) => {
        setOnlineUsers(prev => new Map(prev.set(data.userId, data)));
      });

      // Listen for users list updates
      newSocket.on("online_users", (users: OnlineUser[]) => {
        const usersMap = new Map();
        users.forEach(user => usersMap.set(user.userId, user));
        setOnlineUsers(usersMap);
      });

      // Handle user disconnect
      newSocket.on("user_disconnected", (userId: string) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          if (updated.has(userId)) {
            updated.set(userId, { 
              ...updated.get(userId)!, 
              status: 'offline',
              lastSeen: new Date()
            });
          }
          return updated;
        });
      });

      // Set idle status when user is inactive
      let idleTimer: NodeJS.Timeout;
      const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        if (user?.id) {
          newSocket.emit("user_status", { userId: user.id, status: 'online' });
        }
        idleTimer = setTimeout(() => {
          if (user?.id) {
            newSocket.emit("user_status", { userId: user.id, status: 'idle' });
          }
        }, 5 * 60 * 1000); // 5 minutes
      };

      // Track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
      });

      resetIdleTimer();

      return () => {
        clearTimeout(idleTimer);
        events.forEach(event => {
          document.removeEventListener(event, resetIdleTimer, true);
        });
        newSocket.close();
      };
    } else {
      // In production, use polling for online status updates
      const pollInterval = setInterval(() => {
        fetchOnlineUsers();
      }, 3000); // Poll every 3 seconds

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (retryCount = 0) => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data as User[]);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      
      // If it's a 401 error and we haven't retried too many times, wait and retry
      if (error.response?.status === 401 && retryCount < 3) {
        console.log(`Retrying fetchUsers in 2 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchUsers(retryCount + 1);
        }, 2000);
        return;
      }
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      // For now, simulate online users by marking all users as online
      // In a real implementation, you'd have an API endpoint for online users
      const onlineUsersMap = new Map();
      users.forEach(user => {
        onlineUsersMap.set(user.clerkId, {
          userId: user.clerkId,
          status: 'online' as const,
          lastSeen: new Date(),
          currentSong: null
        });
      });
      setOnlineUsers(onlineUsersMap);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };


  const getStatusText = (status: 'online' | 'idle' | 'offline', lastSeen?: Date) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Away';
      case 'offline':
      default:
        if (lastSeen) {
          const now = new Date();
          const diff = now.getTime() - new Date(lastSeen).getTime();
          const minutes = Math.floor(diff / 60000);
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          
          if (days > 0) return `${days}d ago`;
          if (hours > 0) return `${hours}h ago`;
          if (minutes > 0) return `${minutes}m ago`;
          return 'Just now';
        }
        return 'Offline';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader className="size-6 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 border-l border-zinc-700/50">
      <div className="p-6 border-b border-zinc-700/50 bg-gradient-to-r from-violet-900/20 to-purple-900/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
          <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Friend Activity
          </h3>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          See what your friends are listening to.
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Current User */}
          {user && (
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredUserId('current-user')}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border border-green-500/20 shadow-lg">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-75 blur-sm" />
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'You'}
                    className="relative w-12 h-12 rounded-full object-cover border-2 border-green-400 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-zinc-800 shadow-md">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold truncate text-lg">
                      {user.fullName || 'You'}
                    </p>
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm">
                      You
                    </span>
                  </div>
                  <div className="text-green-400 text-sm font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
                
                {/* Hover Action Buttons for Current User */}
                {hoveredUserId === 'current-user' && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => {
                        // Navigate to profile settings or show profile modal
                        console.log('View your profile');
                      }}
                      className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                      title="View Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Other Users */}
          {users.map((otherUser) => {
            const userStatus = onlineUsers.get(otherUser.clerkId);
            const status = userStatus?.status || 'offline';
            const isListening = userStatus?.currentSong && status === 'online';
            const isHovered = hoveredUserId === otherUser._id;
            
            return (
              <div 
                key={otherUser._id} 
                className="relative group"
                onMouseEnter={() => setHoveredUserId(otherUser._id)}
                onMouseLeave={() => setHoveredUserId(null)}
              >
                <div className={`absolute inset-0 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${
                  status === 'online' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' :
                  status === 'idle' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
                  'bg-gradient-to-r from-zinc-500/10 to-gray-500/10'
                }`} />
                <div className={`relative flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.02] ${
                  status === 'online' ? 'bg-gradient-to-r from-zinc-800/70 to-zinc-700/70 border border-blue-500/20' :
                  status === 'idle' ? 'bg-gradient-to-r from-zinc-800/60 to-zinc-700/60 border border-yellow-500/20' :
                  'bg-gradient-to-r from-zinc-800/40 to-zinc-700/40 border border-zinc-600/20'
                } shadow-lg`}>
                  <div className="relative">
                    <div className={`absolute -inset-0.5 rounded-full opacity-75 blur-sm ${
                      status === 'online' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                      status === 'idle' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      'bg-gradient-to-r from-zinc-400 to-gray-400'
                    }`} />
                    <img
                      src={otherUser.imageUrl}
                      alt={otherUser.fullName}
                      className="relative w-12 h-12 rounded-full object-cover shadow-lg"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-800 shadow-md ${
                      status === 'online' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                      status === 'idle' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      'bg-gradient-to-r from-zinc-400 to-gray-400'
                    }`}>
                      {status === 'online' && (
                        <div className="w-full h-full bg-blue-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-lg mb-1">{otherUser.fullName}</p>
                    {isListening ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-green-400 text-sm font-medium truncate">
                            {userStatus.currentSong?.title}
                          </div>
                          <p className="text-zinc-400 text-xs truncate">
                            by {userStatus.currentSong?.artist}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium truncate ${
                        status === 'online' ? 'text-blue-400' : 
                        status === 'idle' ? 'text-yellow-400' : 
                        'text-zinc-400'
                      }`}>
                        {getStatusText(status, userStatus?.lastSeen)}
                      </p>
                    )}
                  </div>
                  {isListening && userStatus.currentSong && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={userStatus.currentSong.imageUrl}
                          alt="Album cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Action Buttons */}
                  {isHovered && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => {
                          // Navigate to messages page and select this user
                          navigate('/messages', { state: { selectedUserId: otherUser._id, selectedUser: otherUser } });
                        }}
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                        title="Send Message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to profile page or show profile modal
                          navigate('/profile', { state: { userId: otherUser._id, user: otherUser } });
                        }}
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                        title="View Profile"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-r from-zinc-800/60 to-zinc-700/60 rounded-2xl p-8 border border-zinc-600/30">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-zinc-400 to-zinc-300 rounded-full" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">No friends online</p>
                  <p className="text-zinc-500 text-xs mt-1">Invite friends to see their activity</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FriendsActivity;