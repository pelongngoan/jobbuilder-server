import { Schema, model } from "mongoose";

interface IChat {
  userId: Schema.Types.ObjectId;
  staffId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "StaffProfile",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = model<IChat>("Chat", chatSchema);
