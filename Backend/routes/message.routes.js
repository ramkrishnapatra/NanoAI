import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { 
    getMessagesByConversation, 
    saveMessage 
} from "../controllers/message.controller.js";

const router = Router();

// Protect all message routes
router.use(verifyJWT);

// Create a new message in the database (User or AI)
router.route("/").post(saveMessage);

// Get all messages for a specific conversation ID
router.route("/:conversationId").get(getMessagesByConversation);

export default router;