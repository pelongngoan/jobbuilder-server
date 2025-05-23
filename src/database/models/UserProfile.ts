import { Schema, model, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: Schema.Types.ObjectId;
  profile?: Schema.Types.ObjectId;
  savedJobs?: Schema.Types.ObjectId[];
  applications?: Schema.Types.ObjectId[];
  resumes?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },
    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    resumes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Resume",
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries

export const UserProfile = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);
