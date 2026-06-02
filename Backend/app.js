import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Configure CORS to accept requests from our React frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

// Standard middleware for parsing JSON, URL-encoded data, and cookies
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ==========================================
// Routes Import
// ==========================================
import userRouter from './routes/user.routes.js';
import conversationRouter from './routes/conversation.routes.js';
import messageRouter from './routes/message.routes.js';
import aiRouter from './routes/ai.routes.js';

// ==========================================
// Routes Declaration
// ==========================================


// Users: Handles Auth (register, login, logout, profile)
app.use("/api/v1/users", userRouter);

// Conversations: Create, Read, Rename, Delete chat sessions (Sidebar features)
app.use("/api/v1/conversations", conversationRouter);

// Messages: Save and retrieve message history within a specific conversation
app.use("/api/v1/messages", messageRouter);

// AI: Dedicated routes for generating responses (OpenAI API/Gemini API connections)
app.use("/api/v1/ai", aiRouter);

export { app };