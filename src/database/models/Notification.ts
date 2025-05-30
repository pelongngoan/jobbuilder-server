import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  type:
    | "job_application"
    | "chat_message"
    | "application_status"
    | "interview_scheduled"
    | "application_assigned";
  content: string;
  title: string;
  isRead: boolean;
  relatedId?: Schema.Types.ObjectId; // Application ID, Job ID, Chat ID, etc.
  relatedType?: "application" | "job" | "chat" | "interview";
  actionUrl?: string; // URL to navigate to when notification is clicked
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
      enum: [
        "job_application",
        "chat_message",
        "application_status",
        "interview_scheduled",
        "application_assigned",
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    relatedType: {
      type: String,
      enum: ["application", "job", "chat", "interview"],
      required: false,
    },
    actionUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for faster lookup of unread notifications
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
