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
        const currUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin = process.env.ADMIN_EMAIL === currUser.primaryEmailAddress?.emailAddress;

        if (!isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}