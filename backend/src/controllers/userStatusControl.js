import { connectDB } from "../lib/db.js";

// In-memory store for user statuses (for serverless compatibility)
const userStatuses = new Map();

export const updateUserStatus = async (req, res) => {
  try {
    console.log('🔄 [UserStatus] Update request received:', {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
    
    await connectDB();
    
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      console.log('❌ [UserStatus] Missing required fields:', { userId, status });
      return res.status(400).json({
        success: false,
        message: "User ID and status are required"
      });
    }
    
    // Update user status
    const userStatusData = {
      userId,
      status,
      lastSeen: new Date(),
      updatedAt: new Date()
    };
    
    userStatuses.set(userId, userStatusData);
    
    console.log(`✅ [UserStatus] User ${userId} status updated to ${status}`, {
      totalUsers: userStatuses.size,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: userStatusData
    });
  } catch (error) {
    console.error("❌ [UserStatus] Error updating user status:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getUserStatuses = async (req, res) => {
  try {
    console.log('🔍 [UserStatus] Get all statuses request received:', {
      timestamp: new Date().toISOString()
    });
    
    await connectDB();
    
    const allStatuses = Array.from(userStatuses.values());
    
    console.log(`✅ [UserStatus] Retrieved ${allStatuses.length} user statuses`, {
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      data: allStatuses
    });
  } catch (error) {
    console.error("❌ [UserStatus] Error fetching user statuses:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 [UserStatus] Get user status request received:', {
      userId,
      timestamp: new Date().toISOString()
    });
    
    await connectDB();
    
    const userStatus = userStatuses.get(userId);
    
    if (!userStatus) {
      console.log(`❌ [UserStatus] User ${userId} status not found`);
      return res.status(404).json({
        success: false,
        message: "User status not found"
      });
    }
    
    console.log(`✅ [UserStatus] Retrieved status for user ${userId}:`, {
      status: userStatus.status,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      data: userStatus
    });
  } catch (error) {
    console.error("❌ [UserStatus] Error fetching user status:", {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
