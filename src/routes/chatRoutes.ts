import express from "express";
import { chatController } from "../controllers/chatController";
import { verifyUser } from "../middleware/authMiddleware";

const router = express.Router();

// All chat routes require authentication
router.use(verifyUser);

// Create a new chat session
router.post("/", chatController.createChat);

// Get all chats for the authenticated user
router.get("/", chatController.getChats);

// Get messages for a specific chat
router.get("/:chatId/messages", chatController.getChatMessages);

// Send a message in a chat
router.post("/:chatId/messages", chatController.sendMessage);

// Delete a chat session
router.delete("/:chatId", chatController.deleteChat);

export default router;
