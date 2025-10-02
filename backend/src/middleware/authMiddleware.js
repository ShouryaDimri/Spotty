import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
    if(!req.auth.userId){
        res.status(401).json({ message: "Unauthorized: You must log in" });
    return
    }
    next()
}

export const requireAdmin = async (req, res, next) => {
    try {
        console.log("🔐 Checking admin status for user:", req.auth.userId);
        const currUser = await clerkClient.users.getUser(req.auth.userId);
        const userEmail = currUser.primaryEmailAddress?.emailAddress;
        const adminEmail = process.env.ADMIN_EMAIL;
        
        console.log("📧 User email:", userEmail);
        console.log("👑 Admin email:", adminEmail);
        
        const isAdmin = adminEmail === userEmail;
        console.log("✅ Is admin:", isAdmin);

        if (!isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        next();
    } catch (error) {
        console.error("❌ Admin check error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}