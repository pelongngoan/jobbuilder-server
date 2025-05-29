import { Schema, model } from "mongoose";

interface IChatMessage {
  chatId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
