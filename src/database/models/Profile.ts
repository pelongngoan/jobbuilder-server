import { Schema, model, Document } from "mongoose";

export interface IProfile extends Document {
  userId: Schema.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profilePicture: { type: String, required: false },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>("Profile", profileSchema);
