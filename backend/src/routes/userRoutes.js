import { Router } from "express"; // to create modular route handlers
import { protectRoute } from "../middleware/authMiddleware.js"; // authentication middleware    
import { getAllUsers} from "../controllers/userControl.js"; // controller function to get all users

const router = Router();

router.get("/", getAllUsers); // Public for testing

export default router;