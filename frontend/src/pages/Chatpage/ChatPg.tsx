import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader, Paperclip, X, Download, Image, FileText, Music, Video, MoreVertical, Edit, Trash2, Reply, Check, CheckCheck, ArrowLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface User {
  _id: string;
  fullName: string;
  imageUrl: string;
  clerkId: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  createdAt: string;
  replyTo?: {
    messageId: string;
    message: string;
    senderName: string;
  };
}

const ChatPg = () => {
  const { user } = useUser();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showUsersList, setShowUsersList] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Safe array getters
  const safeUsers = Array.isArray(users) ? users : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Auto-focus edit input when editing
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.message-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Socket initialization
  useEffect(() => {
    if (import.meta.env.DEV) {
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5137";
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      if (user?.id) {
        newSocket.emit("join_room", user.id);
      }

      newSocket.on("receive_message", (message: Message) => {
        setMessages(prev => [...(Array.isArray(prev) ? prev : []), message]);
      });

      newSocket.on("message_edited", (data: { messageId: string; message: string }) => {
        setMessages(prev => 
          (Array.isArray(prev) ? prev : []).map(msg => 
            msg._id === data.messageId ? { ...msg, message: data.message } : msg
          )
        );
      });

      newSocket.on("message_deleted", (data: { messageId: string }) => {
        setMessages(prev => 
          (Array.isArray(prev) ? prev : []).filter(msg => msg._id !== data.messageId)
        );
      });

      newSocket.on("user_online", (userId: string) => {
        setOnlineUsers(prev => new Set(prev).add(userId));
      });

      newSocket.on("user_offline", (userId: string) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      });

      return () => newSocket.close();
    } else {
      const pollInterval = setInterval(() => {
        if (selectedUser) {
          fetchMessages(selectedUser.clerkId);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [user?.id, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
      fetchMessages(location.state.selectedUser.clerkId);
      setShowUsersList(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.clerkId);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async (retryCount = 0) => {
    try {
      const response = await axiosInstance.get("/users");
      const userData = response.data as any;
      
      if (Array.isArray(userData)) {
        setUsers(userData);
      } else if (userData?.data && Array.isArray(userData.data)) {
        setUsers(userData.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      
      if (error.response?.status === 401 && retryCount < 3) {
        setTimeout(() => fetchUsers(retryCount + 1), 2000);
        return;
      }
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  const fetchMessages = async (userId: string, retryCount = 0) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      const messageData = response.data as any;
      
      if (Array.isArray(messageData)) {
        setMessages(messageData);
      } else if (messageData?.data && Array.isArray(messageData.data)) {
        setMessages(messageData.data);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      
      if (error.response?.status === 401 && retryCount < 3) {
        setTimeout(() => fetchMessages(userId, retryCount + 1), 2000);
        return;
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('receiverId', selectedUser.clerkId);
      
      if (newMessage.trim()) {
        formData.append('message', newMessage.trim());
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (replyingTo) {
        formData.append('replyToId', replyingTo._id);
      }

      const response = await axiosInstance.post("/messages", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, response.data as Message]);
      
      if (socket) {
        socket.emit("send_message", {
          ...(response.data as any),
          senderId: user?.id,
          receiverId: selectedUser.clerkId
        });
      }
      
      setNewMessage("");
      setSelectedFile(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('File size must be less than 20MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center gap-2`;
    toast.innerHTML = `
      ${type === 'success' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'}
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      if (socket) {
        socket.emit("delete_message", { messageId, receiverId: selectedUser?.clerkId });
      }
      
      showToast('Message deleted successfully');
    } catch (error: any) {
      console.error("Error deleting message:", error);
      showToast(`Failed to delete message: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editedMessage.trim()) return;
    
    try {
      const response = await axiosInstance.put(`/messages/${messageId}`, {
        message: editedMessage.trim()
      });
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, message: (response.data as any).message } : msg
      ));
      
      if (socket) {
        socket.emit("edit_message", { 
          messageId, 
          message: editedMessage.trim(),
          receiverId: selectedUser?.clerkId 
        });
      }
      
      setEditingMessageId(null);
      setEditedMessage("");
      showToast('Message edited successfully');
    } catch (error: any) {
      console.error("Error editing message:", error);
      showToast(`Failed to edit message: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleMenu = (messageId: string) => {
    setOpenMenuId(openMenuId === messageId ? null : messageId);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#1db954] animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex chat-container relative bg-[#121212]" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Users List Sidebar */}
      <div 
        className={`border-r border-[#282828] bg-[#121212] transition-all duration-300 ease-in-out overflow-hidden h-full
          ${isHovered ? 'w-80' : 'w-20'}
          ${showUsersList ? 'block' : 'hidden md:block'}
          absolute md:relative z-20 md:z-auto
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 border-b border-[#282828] flex items-center justify-between flex-shrink-0 bg-[#181818]">
          <h2 className={`text-base font-bold text-white transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            Conversations
          </h2>
          {!isHovered && (
            <div className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center mx-auto">
              <span className="text-black font-bold text-xs">{safeUsers.length}</span>
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="flex flex-col gap-1 p-2">
            {safeUsers.map((chatUser) => {
              const isOnline = onlineUsers.has(chatUser.clerkId);
              const isSelected = selectedUser?._id === chatUser._id;
              return (
                <div
                  key={chatUser._id}
                  onClick={() => {
                    setSelectedUser(chatUser);
                    setShowUsersList(false);
                  }}
                  className={`relative group cursor-pointer transition-colors rounded-lg p-2 ${
                    isSelected 
                      ? 'bg-[#282828]' 
                      : 'hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                        <img
                          src={chatUser.imageUrl || '/cover-images/1.jpg'}
                          alt={chatUser.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#1db954] rounded-full border-2 border-[#121212]" />
                      )}
                    </div>
                    
                    <div className={`flex-1 min-w-0 transition-opacity duration-200 ${
                      isHovered ? 'opacity-100' : 'opacity-0 w-0'
                    }`}>
                      <p className={`font-medium text-sm truncate ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>{chatUser.fullName}</p>
                      <p className="text-zinc-400 text-xs">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#121212]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#282828] bg-[#181818] flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUsersList(true)}
                  className="md:hidden text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <img
                    src={selectedUser.imageUrl || '/cover-images/1.jpg'}
                    alt={selectedUser.fullName}
                    className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                  />
                  {onlineUsers.has(selectedUser.clerkId) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1db954] rounded-full border-2 border-[#181818]" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{selectedUser.fullName}</h3>
                  <p className="text-zinc-400 text-xs">
                    {onlineUsers.has(selectedUser.clerkId) ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="space-y-3 pb-20">
                {safeMessages.map((message) => {
                  const isMyMessage = message.senderId === user?.id;
                  const isEditing = editingMessageId === message._id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}
                      onMouseEnter={() => setHoveredMessageId(message._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div className="relative max-w-[75%] sm:max-w-md lg:max-w-lg">
                        <div
                          className={`relative px-4 py-2.5 rounded-xl text-sm ${
                            isMyMessage
                              ? 'bg-[#1db954] text-black font-medium'
                              : 'bg-[#282828] text-white'
                          }`}
                        >
                          {/* Options Menu */}
                          <div className="absolute -top-2 -right-2 z-10">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleMenu(message._id)}
                              className={`h-6 w-6 rounded-full bg-[#181818] text-zinc-300 hover:text-white transition-opacity ${
                                hoveredMessageId === message._id || openMenuId === message._id ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                            
                            {openMenuId === message._id && (
                              <div className="absolute right-0 top-8 z-50 bg-[#181818] border border-[#282828] rounded-md py-1 min-w-[120px] shadow-xl">
                                {isMyMessage && (
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(message._id);
                                      setEditedMessage(message.message || "");
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#282828] flex items-center gap-2"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Edit</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleReplyToMessage(message);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#282828] flex items-center gap-2"
                                >
                                  <Reply className="h-3.5 w-3.5 text-[#1db954]" />
                                  <span>Reply</span>
                                </button>
                                {isMyMessage && (
                                  <button
                                    onClick={() => {
                                      handleDeleteMessage(message._id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-900/30 flex items-center gap-2 border-t border-[#282828] mt-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className={`mb-1.5 p-1.5 rounded border-l-2 text-xs ${
                              isMyMessage 
                                ? 'bg-black/10 border-black/30 text-black/80' 
                                : 'bg-white/5 border-[#1db954] text-zinc-300'
                            }`}>
                              <p className="font-semibold">{message.replyTo.senderName}</p>
                              <p className="truncate opacity-90">{message.replyTo.message}</p>
                            </div>
                          )}
                          
                          {/* Message Content */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editedMessage}
                                onChange={(e) => setEditedMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditMessage(message._id);
                                  if (e.key === 'Escape') {
                                    setEditingMessageId(null);
                                    setEditedMessage("");
                                  }
                                }}
                                className="w-full px-2.5 py-1 bg-black/10 border border-black/20 rounded text-sm focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditMessage(message._id)}
                                  className="bg-black/20 hover:bg-black/30 text-xs h-6 px-2"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditedMessage("");
                                  }}
                                  className="text-xs h-6 px-2"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            message.message && (
                              <p className="leading-relaxed break-words">{message.message}</p>
                            )
                          )}
                          
                          {/* File Attachment */}
                          {message.fileUrl && (
                            <div className="mt-2 pt-2 border-t border-black/10">
                              {message.fileType?.startsWith('image/') ? (
                                <div className="relative">
                                  <img
                                    src={message.fileUrl}
                                    alt={message.fileName}
                                    className="max-w-full h-auto rounded cursor-pointer hover:opacity-95"
                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">{message.fileName}</p>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                    className="h-6 w-6"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <p className={`text-[10px] ${
                              isMyMessage ? 'text-black/70' : 'text-zinc-400'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {isMyMessage && (
                              <CheckCheck className="h-3 w-3 text-black/70" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-[#282828] bg-[#181818] chat-input-area">
              <form onSubmit={sendMessage} className="p-3">
                {/* Reply Preview */}
                {replyingTo && (
                  <div className="mb-2 p-2 bg-[#282828] rounded flex items-center justify-between border border-white/5">
                    <div className="min-w-0">
                      <p className="text-zinc-400 text-xs">Replying to {replyingTo.senderName}</p>
                      <p className="text-white text-xs truncate">{replyingTo.message}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={cancelReply}
                      className="text-zinc-400 hover:text-white h-6 w-6"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-2 p-2 bg-[#282828] rounded flex items-center justify-between border border-white/5">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{selectedFile.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeSelectedFile}
                      className="text-zinc-400 hover:text-white h-6 w-6"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <label className="relative flex items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-[#282828] rounded-full h-10 w-10"
                      asChild
                    >
                      <span>
                        <Paperclip className="h-5 w-5" />
                      </span>
                    </Button>
                  </label>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-[#282828] border border-transparent rounded-full text-white placeholder-zinc-400 focus:outline-none text-sm"
                    disabled={isUploading}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isUploading || (!newMessage.trim() && !selectedFile)}
                    className="bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full h-10 w-10 p-0"
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
              <div className="w-16 h-16 bg-[#181818] border border-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#1db954]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Your Messages
              </h3>
              <p className="text-zinc-400 text-sm">
                Send private messages to friends and listen together.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPg;