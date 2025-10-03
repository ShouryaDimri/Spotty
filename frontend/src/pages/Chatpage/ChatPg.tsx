import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader, Paperclip, X, Download, Image, FileText, Music, Video, MoreVertical, Edit, Trash2, Reply } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.message-menu')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    // Initialize socket in development
    if (import.meta.env.DEV) {
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5137";
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      if (user?.id) {
        newSocket.emit("join_room", user.id);
      }

      // Listen for incoming messages
      newSocket.on("receive_message", (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for message edits
      newSocket.on("message_edited", (data: { messageId: string; message: string }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, message: data.message } : msg
        ));
      });

      // Listen for message deletions
      newSocket.on("message_deleted", (data: { messageId: string }) => {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });

      return () => {
        newSocket.close();
      };
    } else {
      // In production, use polling for real-time updates
      const pollInterval = setInterval(() => {
        if (selectedUser) {
          fetchMessages(selectedUser.clerkId);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [user?.id, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle selected user from navigation state
  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
      fetchMessages(location.state.selectedUser.clerkId);
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.message-menu')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  const fetchMessages = async (userId: string, retryCount = 0) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
        setMessages(response.data as Message[]);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      
      // If it's a 401 error and we haven't retried too many times, wait and retry
      if (error.response?.status === 401 && retryCount < 3) {
        console.log(`Retrying fetchMessages in 2 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchMessages(userId, retryCount + 1);
        }, 2000);
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

      // Include reply information if replying
      if (replyingTo) {
        formData.append('replyToId', replyingTo._id);
      }

      const response = await axiosInstance.post("/messages", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

        setMessages(prev => [...prev, response.data as Message]);
      
      if (socket) {
        socket.emit("send_message", {
          senderId: user?.id,
          receiverId: selectedUser.clerkId,
          message: newMessage.trim(),
          fileUrl: (response.data as any).fileUrl,
          fileType: (response.data as any).fileType,
          fileName: (response.data as any).fileName,
          replyTo: (response.data as any).replyTo
        });
      }
      
      setNewMessage("");
      setSelectedFile(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      console.log("Deleting message:", messageId);
      const response = await axiosInstance.delete(`/messages/${messageId}`);
      console.log("Delete response:", response.status);
      
      if (response.status === 200) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        if (socket) {
          socket.emit("delete_message", { messageId, receiverId: selectedUser?.clerkId });
        }
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Message deleted successfully';
        document.body.appendChild(successDiv);
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error deleting message:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = `Failed to delete message: ${error.response?.data?.message || error.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    if (!editedMessage.trim()) return;
    
    try {
      console.log("Editing message:", messageId, "with text:", editedMessage.trim());
      const response = await axiosInstance.put(`/messages/${messageId}`, {
        message: editedMessage.trim()
      });
      console.log("Edit response:", response.status);
      
      if (response.status === 200) {
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
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Message edited successfully';
        document.body.appendChild(successDiv);
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error editing message:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = `Failed to edit message: ${error.response?.data?.message || error.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleMenu = (messageId: string) => {
    console.log('Toggle menu for message:', messageId);
    setOpenMenuId(openMenuId === messageId ? null : messageId);
  };

  const closeMenu = () => {
    console.log('Closing menu');
    setOpenMenuId(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex chat-container relative" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Users List */}
      <div 
        className={`border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden h-full
          ${isHovered ? 'w-80' : 'w-16'}
          md:${isHovered ? 'w-80' : 'w-16'}
          ${showUsersList ? 'block' : 'hidden md:block'}
          ${selectedUser && !showUsersList ? 'hidden' : 'block'}
          md:block absolute md:relative z-20 md:z-auto
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-center flex-shrink-0">
          <h2 className={`text-lg font-semibold text-white transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {isHovered ? 'Messages' : ''}
          </h2>
          {!isHovered && (
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="flex flex-wrap gap-2 p-2">
            {users.map((chatUser) => (
              <div
                key={chatUser._id}
                onClick={() => {
                  setSelectedUser(chatUser);
                  setShowUsersList(false); // Hide user list on mobile when selecting a user
                }}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedUser?._id === chatUser._id 
                    ? 'scale-110' 
                    : 'hover:scale-105'
                }`}
                title={chatUser.fullName}
              >
                <div className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                  selectedUser?._id === chatUser._id 
                    ? 'border-green-400 shadow-lg shadow-green-400/50' 
                    : 'border-zinc-600 hover:border-zinc-400'
                }`}>
                  <img
                    src={chatUser.imageUrl}
                    alt={chatUser.fullName}
                    className="w-full h-full object-cover"
                  />
                  {selectedUser?._id === chatUser._id && (
                    <div className="absolute inset-0 bg-green-400/20 rounded-full" />
                  )}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                  {chatUser.fullName}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUsersList(true)}
                  className="md:hidden text-zinc-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </Button>
                <img
                  src={selectedUser.imageUrl}
                  alt={selectedUser.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <h3 className="text-white font-medium">{selectedUser.fullName}</h3>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
              <div className="space-y-4 min-h-full">
                {messages.map((message) => {
                  const isMyMessage = message.senderId === user?.id;
                  const isEditing = editingMessageId === message._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}
                      onMouseEnter={() => setHoveredMessageId(message._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div className="relative flex items-start gap-2">
                        {/* Message Bubble */}
                        <div
                          className={`relative max-w-[75%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            isMyMessage
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black'
                              : 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white'
                          } shadow-lg`}
                        >
                          {/* 3-Dot Menu - Show on top right of message on hover, only for own messages */}
                          {isMyMessage && (
                            <div className="absolute -top-2 -right-2 z-10 message-menu">
                              {/* 3-Dot Button - Show on hover */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleMenu(message._id)}
                                className={`h-6 w-6 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-opacity duration-200 ${
                                  hoveredMessageId === message._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                                title="More options"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                              
                              {/* Dropdown Menu */}
                              {openMenuId === message._id && (
                                <div className="absolute right-0 top-8 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 min-w-[80px]">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Edit clicked for message:', message._id);
                                      setEditingMessageId(message._id);
                                      setEditedMessage(message.message || "");
                                      closeMenu();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 flex items-center justify-center"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Reply clicked for message:', message._id);
                                      handleReplyToMessage(message);
                                      closeMenu();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 flex items-center justify-center"
                                    title="Reply"
                                  >
                                    <Reply className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Delete clicked for message:', message._id);
                                      handleDeleteMessage(message._id);
                                      closeMenu();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center justify-center"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        {/* Reply Preview */}
                        {message.replyTo && (
                          <div className={`mb-2 p-2 rounded border-l-2 ${
                            isMyMessage 
                              ? 'bg-black/20 border-black/40' 
                              : 'bg-white/10 border-white/30'
                          }`}>
                            <p className="text-xs opacity-70">{message.replyTo.senderName}</p>
                            <p className="text-sm truncate">{message.replyTo.message}</p>
                          </div>
                        )}
                        
                        {/* Text Message - Edit Mode */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editedMessage}
                              onChange={(e) => setEditedMessage(e.target.value)}
                              className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditMessage(message._id)}
                                className="bg-white/20 hover:bg-white/30 text-xs"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditedMessage("");
                                }}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          message.message && (
                            <p className="mb-2">{message.message}</p>
                          )
                        )}
                        
                        {/* File Attachment */}
                        {message.fileUrl && (
                          <div className="border-t border-opacity-20 pt-2 mt-2">
                            {message.fileType?.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={message.fileUrl}
                                  alt={message.fileName}
                                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(message.fileUrl, '_blank')}
                                />
                                <p className="text-xs mt-1 opacity-80">{message.fileName}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                                {getFileIcon(message.fileType || '')}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                                  <p className="text-xs opacity-80">{message.fileType}</p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => window.open(message.fileUrl, '_blank')}
                                  className="h-8 w-8 hover:bg-white/20"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className={`text-xs mt-2 ${
                          isMyMessage ? 'text-black/70' : 'text-zinc-400'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800 chat-input-area">
              <form onSubmit={sendMessage} className="p-4">
                {/* Reply Preview */}
                {replyingTo && (
                  <div className="mb-3 p-3 bg-zinc-700/50 rounded-lg flex items-start gap-3">
                    <Reply className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-400 text-xs">Replying to</p>
                      <p className="text-white text-sm truncate">{replyingTo.message}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={cancelReply}
                      className="text-zinc-400 hover:text-white w-8 h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-zinc-700/50 rounded-lg flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-zinc-400 text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeSelectedFile}
                      className="text-zinc-400 hover:text-white w-8 h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {/* File Upload Button */}
                  <label className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                      asChild
                    >
                      <span>
                        <Paperclip className="h-5 w-5" />
                      </span>
                    </Button>
                  </label>
                  
                  {/* Message Input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedFile ? "Add a message (optional)..." : "Type a message..."}
                    className="flex-1 px-3 sm:px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                  
                  {/* Send Button */}
                  <Button 
                    type="submit" 
                    disabled={isUploading || (!newMessage.trim() && !selectedFile)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
              <p className="text-zinc-400">Choose someone from your contacts to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPg;