import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader, Paperclip, X, Download, Image, FileText, Music, Video } from "lucide-react";
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
}

const ChatPg = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5137");
    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit("join_room", user.id);
    }

    // Listen for incoming messages
    newSocket.on("receive_message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.clerkId);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser || !socket) return;

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

      const response = await axiosInstance.post("/messages", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages(prev => [...prev, response.data]);
      socket.emit("send_message", {
        senderId: user?.id,
        receiverId: selectedUser.clerkId,
        message: newMessage.trim(),
        fileUrl: response.data.fileUrl,
        fileType: response.data.fileType,
        fileName: response.data.fileName
      });
      
      setNewMessage("");
      setSelectedFile(null);
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex chat-container" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Users List */}
      <div 
        className={`border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden h-full ${
          isHovered ? 'w-80' : 'w-16'
        }`}
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
          <div className="space-y-2 p-2">
            {users.map((chatUser) => (
              <div
                key={chatUser._id}
                onClick={() => setSelectedUser(chatUser)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors 
                  ${selectedUser?._id === chatUser._id 
                    ? 'bg-zinc-700' 
                    : 'hover:bg-zinc-800'
                  }`}
              >
                <img
                  src={chatUser.imageUrl}
                  alt={chatUser.fullName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className={`flex-1 min-w-0 transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                  <p className="text-white font-medium truncate">{chatUser.fullName}</p>
                  <p className="text-zinc-400 text-sm">Click to chat</p>
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
                <img
                  src={selectedUser.imageUrl}
                  alt={selectedUser.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <h3 className="text-white font-medium">{selectedUser.fullName}</h3>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" style={{ height: 'calc(100vh - 240px)' }}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMyMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          isMyMessage
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black'
                            : 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white'
                        } shadow-lg`}
                      >
                        {/* Text Message */}
                        {message.message && (
                          <p className="mb-2">{message.message}</p>
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
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800 chat-input-area">
              <form onSubmit={sendMessage} className="p-4">
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
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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