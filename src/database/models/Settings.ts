import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  userId: Schema.Types.ObjectId;
  notifications: boolean;
  privacy: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notifications: { type: Boolean, default: true },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

export const Settings = model<ISettings>("Settings", settingsSchema);
