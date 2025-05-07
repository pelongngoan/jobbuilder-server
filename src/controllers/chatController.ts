import { Request, Response } from "express";
import { Chat } from "../database/models/Chat";
import { ChatMessage } from "../database/models/ChatMessage";
import { chatUtils } from "../utils/chatUtils";

export const chatController = {
  // Create a new chat session
  async createChat(req: Request, res: Response) {
    try {
      const { title } = req.body;
      const userId = req.userId;

      const chat = await Chat.create({
        userId,
        title,
      });

      // Create initial welcome message in multiple languages
      await ChatMessage.create({
        chatId: chat._id,
        content: `# 🌍 Welcome to JobBuilder Chat! / Chào mừng đến với JobBuilder Chat! 🌍

🇺🇸 English:
Hello! I'm your multilingual job search assistant. I can help you with:
- Finding jobs
- Resume recommendations
- Company information
- Job search guidance

You can ask me questions in English, Vietnamese, or mix both languages!

🇻🇳 Tiếng Việt:
Xin chào! Tôi là trợ lý tìm việc đa ngôn ngữ của bạn. Tôi có thể giúp bạn với:
- Tìm việc làm
- Gợi ý về sơ yếu lý lịch
- Thông tin về công ty
- Hướng dẫn tìm việc

Bạn có thể hỏi tôi bằng tiếng Việt, tiếng Anh hoặc kết hợp cả hai ngôn ngữ!

What would you like to know? / Bạn muốn biết thêm về điều gì?`,
        role: "assistant",
      });

      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Error creating chat", error });
    }
  },

  // Get all chats for a user
  async getChats(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chats", error });
    }
  },

  // Get messages for a specific chat
  async getChatMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const messages = await ChatMessage.find({ chatId })
        .sort({ createdAt: 1 })
        .populate("jobRecommendations");
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  },

  // Send a message and get job recommendations
  async sendMessage(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      // Save user message
      const userMessage = await ChatMessage.create({
        chatId,
        content,
        role: "user",
      });

      // Update chat's last message
      await Chat.findByIdAndUpdate(chatId, { lastMessage: content });

      // Analyze query and generate response
      const queryType = chatUtils.analyzeQuery(content);
      const response = await chatUtils.generateResponse(queryType, content);

      // Create assistant response
      const assistantMessage = await ChatMessage.create({
        chatId,
        content: response.content,
        role: "assistant",
        jobRecommendations: response.jobRecommendations.map((job) => job._id),
      });

      // Populate job recommendations
      await assistantMessage.populate("jobRecommendations");

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      res.status(500).json({ message: "Error sending message", error });
    }
  },

  // Delete a chat session
  async deleteChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      await Chat.findByIdAndDelete(chatId);
      await ChatMessage.deleteMany({ chatId });
      res.json({ message: "Chat deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting chat", error });
    }
  },
};
