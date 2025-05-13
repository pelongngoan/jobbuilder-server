import { Schema, model, Document } from "mongoose";

export interface IAdminProfile extends Document {
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const adminProfileSchema = new Schema<IAdminProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

adminProfileSchema.index({ userId: 1 });

export const AdminProfile = model<IAdminProfile>(
  "AdminProfile",
  adminProfileSchema
);
