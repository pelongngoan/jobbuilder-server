import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  type: "application_status" | "job_recommendation" | "message" | "system";
  content: string;
  isRead: boolean;
  referenceId?: Schema.Types.ObjectId;
  referenceModel?: string;
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
      enum: ["application_status", "job_recommendation", "message", "system"],
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
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    referenceModel: {
      type: String,
      enum: ["Job", "Application", "Chat", "Company", "User", "StaffProfile"],
      required: false,
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
