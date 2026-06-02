import {Conversation }from "../models/Conversation.js";
import {Message} from "../models/Message.js";

// @desc    Create a new conversation
// @route   POST /api/v1/conversations
// @access  Protected
export const createConversation = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.create({
            userId,
            title: title || "New Chat"
        });

        return res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            data: conversation
        });
    } catch (error) {
        console.error("Create Conversation Error:", error);
        return res.status(500).json({ success: false, message: "Server error while creating conversation" });
    }
};

// @desc    Get all conversations for the logged-in user (Sidebar list)
// @route   GET /api/v1/conversations
// @access  Protected
export const getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch conversations sorted by most recently updated
        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            data: conversations
        });
    } catch (error) {
        console.error("Fetch Conversations Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching conversations" });
    }
};

// @desc    Get a specific conversation by ID
// @route   GET /api/v1/conversations/:id
// @access  Protected
export const getConversationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({ _id: id, userId });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation fetched successfully",
            data: conversation
        });
    } catch (error) {
        console.error("Fetch Conversation by ID Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching conversation" });
    }
};

// @desc    Update conversation title
// @route   PATCH /api/v1/conversations/:id
// @access  Protected
export const updateConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user._id;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        const conversation = await Conversation.findOneAndUpdate(
            { _id: id, userId },
            { title, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation renamed successfully",
            data: conversation
        });
    } catch (error) {
        console.error("Update Conversation Error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating conversation" });
    }
};

// @desc    Delete a conversation and its messages
// @route   DELETE /api/v1/conversations/:id
// @access  Protected
export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOneAndDelete({ _id: id, userId });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        // Also delete all messages associated with this conversation to prevent orphan documents
        await Message.deleteMany({ conversationId: id });

        return res.status(200).json({
            success: true,
            message: "Conversation and associated messages deleted successfully"
        });
    } catch (error) {
        console.error("Delete Conversation Error:", error);
        return res.status(500).json({ success: false, message: "Server error while deleting conversation" });
    }
};