import { Schema, model } from "mongoose";

interface IChatMessage {
  chatId: Schema.Types.ObjectId;
  content: string;
  role: "user" | "assistant";
  jobRecommendations?: Schema.Types.ObjectId[];
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    jobRecommendations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
