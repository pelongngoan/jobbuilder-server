import express from "express";
import { chatController } from "../controllers/chatController";
import {
  verifyUser,
  verifyStaff,
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

// All chat routes require authentication
router.use(verifyUser);

// User chat routes
// Create a new chat session
router.post("/", authenticate, chatController.createChat);

// Get all chats for the authenticated user
router.get("/", authenticate, chatController.getChats);

//Get chat by id
router.get("/:chatId", authenticate, chatController.getChatById);

// Get messages for a specific chat
router.get("/:chatId/messages", authenticate, chatController.getChatMessages);

// Get chat by receiver id
router.get(
  "/receiver/:receiverId",
  authenticate,
  chatController.getChatByReceiverId
);

// Send a message to a specific chat
router.post("/:chatId/messages", authenticate, chatController.sendMessage);

// Delete a chat session
router.delete("/:chatId", authenticate, chatController.deleteChat);

export default router;
