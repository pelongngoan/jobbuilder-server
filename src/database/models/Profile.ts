import { Schema, model, Document } from "mongoose";

export interface IProfile extends Document {
  userId: Schema.Types.ObjectId;
  bio?: string;
  phone?: string;
  location?: string;
  experience?: { company: string; role: string; years: number }[];
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    experience: [{ company: String, role: String, years: Number }],
    skills: [{ type: String }],
  },
  { timestamps: true }
);

export const Profile = model<IProfile>("Profile", profileSchema);
