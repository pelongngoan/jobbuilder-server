import { Schema, model } from "mongoose";

interface IChat {
  userId: Schema.Types.ObjectId;
  title: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = model<IChat>("Chat", chatSchema);
