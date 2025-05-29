import express from "express";
import { chatbotController } from "../controllers/chatbotController";
import { authenticate } from "../middleware/authMiddleware";
import {
  uploadChatbotFiles,
  handleUploadError,
} from "../middleware/uploadMiddleware";

const router = express.Router();

// Get welcome message (no authentication required for demo purposes)
router.get("/welcome", (req, res, next) => {
  chatbotController.getWelcomeMessage(req, res).catch(next);
});

// Ask a question to the chatbot with optional file uploads
router.post("/ask", uploadChatbotFiles, handleUploadError, (req, res, next) => {
  chatbotController.askQuestion(req, res).catch(next);
});

// If you want to require authentication, uncomment the line below:
// router.post("/ask", authenticate, uploadChatbotFiles, handleUploadError, chatbotController.askQuestion);

export default router;
