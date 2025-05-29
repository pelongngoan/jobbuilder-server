import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  type: "job_application" | "chat_message";
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["job_application", "chat_message"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster lookup of unread notifications
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
