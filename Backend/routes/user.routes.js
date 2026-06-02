import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile 
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Protected routes (Requires valid JWT token)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getUserProfile);

export default router;