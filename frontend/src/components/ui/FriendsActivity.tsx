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

  const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase && !apiBase.includes('localhost') && !apiBase.startsWith('/')) {
      return apiBase.replace(/\/api\/?$/, '');
    }
    if (import.meta.env.DEV) {
      return "http://localhost:5137";
    }
    return null;
  };

  useEffect(() => {
    const socketUrl = getSocketUrl();
    if (socketUrl) {
      const newSocket = io(socketUrl);
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
      // In production without socket server, use periodic status check
      const pollInterval = setInterval(() => {
        fetchOnlineUsers();
      }, 15000); // Poll every 15 seconds

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
      const userData = response.data as any;
      if (Array.isArray(userData)) {
        setUsers(userData);
      } else if (userData && Array.isArray(userData.data)) {
        setUsers(userData.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      
      if (error.response?.status === 401 && retryCount < 3) {
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
      <div className="p-4 flex items-center justify-center bg-[#121212]">
        <Loader className="size-6 text-[#1db954] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#121212] border-l border-[#282828] select-none">
      <div className="p-4 border-b border-[#282828] bg-[#181818] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="size-4 text-[#1db954]" />
          <h3 className="font-semibold text-white text-sm">Friend Activity</h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Current User */}
          {user && (
            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-[#181818] border border-white/5"
              onMouseEnter={() => setHoveredUserId('current-user')}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <div className="relative">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'You'}
                  className="w-10 h-10 rounded-full object-cover border border-[#1db954]"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#1db954] rounded-full border-2 border-[#181818]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs truncate">
                  {user.fullName || 'You'} <span className="text-[10px] text-[#1db954] ml-1">(You)</span>
                </p>
                <div className="text-xs text-[#1db954]">Online</div>
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
                className="relative group p-3 rounded-lg bg-[#181818] hover:bg-[#282828] border border-transparent hover:border-white/5 transition-colors flex items-center gap-3"
                onMouseEnter={() => setHoveredUserId(otherUser._id)}
                onMouseLeave={() => setHoveredUserId(null)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={otherUser.imageUrl || '/cover-images/1.jpg'}
                    alt={otherUser.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#181818] ${
                    status === 'online' ? 'bg-[#1db954]' :
                    status === 'idle' ? 'bg-amber-400' :
                    'bg-zinc-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-xs truncate">{otherUser.fullName}</p>
                  {isListening ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-[#1db954] truncate">{userStatus.currentSong?.title}</span>
                      <span className="text-[11px] text-zinc-400 truncate">{userStatus.currentSong?.artist}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 truncate">
                      {getStatusText(status, userStatus?.lastSeen)}
                    </p>
                  )}
                </div>

                {isListening && userStatus.currentSong && (
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={userStatus.currentSong.imageUrl}
                      alt="Album"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Hover Quick Actions */}
                {isHovered && (
                  <div className="absolute right-2 flex items-center gap-1 bg-[#282828] p-1 rounded-full border border-white/10 shadow-lg">
                    <button
                      onClick={() => navigate('/chat', { state: { selectedUserId: otherUser._id, selectedUser: otherUser } })}
                      className="p-1.5 hover:bg-[#333] text-white rounded-full transition-colors"
                      title="Send Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#1db954]" />
                    </button>
                    <button
                      onClick={() => navigate('/profile', { state: { userId: otherUser._id, user: otherUser } })}
                      className="p-1.5 hover:bg-[#333] text-white rounded-full transition-colors"
                      title="View Profile"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-300" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {users.length === 0 && (
            <div className="text-center py-10 px-2 bg-[#181818] rounded-lg border border-[#282828]">
              <User className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-zinc-400 text-xs font-medium">No friends online</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FriendsActivity;