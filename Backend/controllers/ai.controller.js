import {Message} from "../models/Message.js";
import {Conversation} from "../models/Conversation.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

// Initialize AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

export const generateResponse = async (req, res) => {
    try {
        const { conversationId, prompt } = req.body;
        const userId = req.user._id;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        // 1. Handle Invalid/Missing conversationId gracefully for testing
        const isValidId = mongoose.Types.ObjectId.isValid(conversationId);
        let conversation = null;

        if (conversationId && isValidId) {
             conversation = await Conversation.findOne({ _id: conversationId, userId });
        }

        // 2. Fetch history ONLY if we have a valid, existing conversation
        let history = [];
        if (conversation) {
            history = await Message.find({ conversationId })
                .sort({ createdAt: 1 })
                .limit(20);
        }

        // Format history for Gemini API
        const formattedHistory = history.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        // 3. Call the AI Model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Start chat with history (if history exists, slice off last element just in case)
        const chat = model.startChat({ 
            history: formattedHistory.length > 0 ? formattedHistory.slice(0, -1) : [] 
        }); 
        
        const result = await chat.sendMessage(prompt);
        const aiResponseText = result.response.text();

        // 4. Save to DB ONLY if we have a valid conversation context
        let userMessage = { role: "user", content: prompt };
        let aiMessage = { role: "assistant", content: aiResponseText };

        if (conversation) {
            userMessage = await Message.create({
                conversationId,
                role: "user",
                content: prompt
            });

            aiMessage = await Message.create({
                conversationId,
                role: "assistant",
                content: aiResponseText
            });

            conversation.updatedAt = Date.now();
            
            // Auto-title
            if (conversation.title === "New Chat") {
                 const titleResult = await model.generateContent(`Generate a short, 3-4 word title for a conversation starting with this prompt: "${prompt}". Do not use quotes.`);
                 conversation.title = titleResult.response.text().trim();
            }
            await conversation.save();
        } else {
            console.log("No valid conversationId provided. Skipping database save, but returning AI response.");
        }

        // 5. Return Response
        return res.status(200).json({
            success: true,
            message: "Response generated successfully",
            data: {
                userMessage,
                aiMessage
            }
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to generate AI response. Please try again later." 
        });
    }
};