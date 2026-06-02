import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { 
    createConversation, 
    getUserConversations, 
    getConversationById, 
    updateConversation, 
    deleteConversation 
} from "../controllers/conversation.controller.js";

const router = Router();

// Apply auth middleware to ALL routes in this file
router.use(verifyJWT); 

// Root routes (/api/v1/conversations)
router.route("/")
    .post(createConversation)      // Start a new chat
    .get(getUserConversations);    // Get all chats for the sidebar

// ID specific routes (/api/v1/conversations/:id)
router.route("/:id")
    .get(getConversationById)      // Load a specific chat
    .patch(updateConversation)     // Rename chat title
    .delete(deleteConversation);   // Delete chat

export default router;