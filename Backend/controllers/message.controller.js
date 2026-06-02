import {Message} from "../models/Message.js";
import {Conversation} from "../models/Conversation.js";

// @desc    Get all messages for a specific conversation
// @route   GET /api/v1/messages/:conversationId
// @access  Protected
export const getMessagesByConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Verify the conversation belongs to the user
        const conversation = await Conversation.findOne({ _id: conversationId, userId });
        
        if (!conversation) {
            return res.status(403).json({ success: false, message: "Not authorized to access this conversation" });
        }

        // Fetch messages, sorting by creation time (oldest to newest for chat flow)
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages
        });
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching messages" });
    }
};

// @desc    Save a new message manually (fallback, usually AI route handles this)
// @route   POST /api/v1/messages
// @access  Protected
export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content } = req.body;
        const userId = req.user._id;

        if (!conversationId || !role || !content) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify ownership
        const conversation = await Conversation.findOne({ _id: conversationId, userId });
        if (!conversation) {
            return res.status(403).json({ success: false, message: "Not authorized to access this conversation" });
        }

        // Create the message
        const message = await Message.create({
            conversationId,
            role, // 'user' or 'assistant'
            content
        });

        // Update conversation's updatedAt timestamp so it jumps to the top of the sidebar
        conversation.updatedAt = Date.now();
        await conversation.save();

        return res.status(201).json({
            success: true,
            message: "Message saved successfully",
            data: message
        });
    } catch (error) {
        console.error("Save Message Error:", error);
        return res.status(500).json({ success: false, message: "Server error while saving message" });
    }
};