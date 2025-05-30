import { Request, Response } from "express";
import { Chat } from "../database/models/Chat";
import { ChatMessage } from "../database/models/ChatMessage";
import { createNotificationHelper } from "./notificationController";
import { io } from "../index";
import { emitNotification, emitChatMessage } from "../config/socket";

export const chatController = {
  // Create a new chat session
  async createChat(req: Request, res: Response) {
    try {
      const { userId, staffId } = req.body;

      const chat = await Chat.create({
        userId,
        staffId,
      });

      res.status(201).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating chat", error });
    }
  },

  // Get all chats for a user
  async getChats(req: Request, res: Response) {
    try {
      const userId = req.userProfileId;
      const staffId = req.staffProfileId;
      const chats = await Chat.find({
        $or: [{ userId }, { staffId }],
      })
        .sort({ updatedAt: -1 })
        .populate({
          path: "staffId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        })
        .populate({
          path: "userId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        });
      res.json({
        success: true,
        data: chats,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching chats", error });
    }
  },

  // Get chat by id
  async getChatById(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId)
        .populate({
          path: "staffId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        })
        .populate({
          path: "userId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        });
      if (!chat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }
      res.json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat", error });
    }
  },

  // Get messages for a specific chat
  async getChatMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const messages = await ChatMessage.find({ chatId }).sort({
        createdAt: 1,
      });
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  },

  // Get chat by receiver id
  async getChatByReceiverId(req: Request, res: Response) {
    try {
      const { receiverId } = req.params;
      const userId = req.userProfileId;
      console.log(receiverId, userId);
      const chat = await Chat.findOne({
        $or: [
          { userId, staffId: receiverId },
          { userId: receiverId, staffId: userId },
        ],
      });

      res.json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat", error });
    }
  },

  // Send a message and get job recommendations
  async sendMessage(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      // Get chat info to determine chat type
      const chat = await Chat.findById(chatId)
        .populate({
          path: "staffId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        })
        .populate({
          path: "userId",
          populate: {
            path: "profile",
            select: "email firstName lastName profilePicture",
          },
        });

      if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
      }

      // Save user message
      const userMessage = await ChatMessage.create({
        chatId,
        senderId: userId,
        content,
      });

      // Update chat's updatedAt timestamp
      await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

      // Determine receiver for notification
      const chatUser = chat.userId as any;
      const chatStaff = chat.staffId as any;

      const receiverId =
        chatUser?._id?.toString() === userId
          ? chatStaff?._id?.toString()
          : chatUser?._id?.toString();

      // Create notification for the receiver if they're not the sender
      if (receiverId && receiverId !== userId) {
        try {
          const senderInfo =
            chatUser?._id?.toString() === userId
              ? chatUser?.profile
              : chatStaff?.profile;

          const notification = await createNotificationHelper({
            userId: receiverId,
            type: "chat_message",
            title: "New Message",
            content: `You have a new message from ${senderInfo?.firstName} ${senderInfo?.lastName}`,
            relatedId: chatId,
            relatedType: "chat",
            actionUrl: `/user/chat/${chatId}`,
          });

          // Emit real-time notification
          emitNotification(io, receiverId, notification);
        } catch (notificationError) {
          console.error("Error creating chat notification:", notificationError);
        }
      }

      // Emit real-time chat message to all participants
      emitChatMessage(io, chatId, userMessage);

      const messages = await ChatMessage.find({ chatId }).sort({
        createdAt: 1,
      });

      res.json({
        success: true,
        data: messages,
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
