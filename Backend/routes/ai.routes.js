import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { generateResponse } from "../controllers/ai.controller.js";

const router = Router();

// Protect AI generation routes
router.use(verifyJWT);

// Endpoint to trigger OpenAI/Gemini to generate a response
router.route("/generate").post(generateResponse);

export default router;