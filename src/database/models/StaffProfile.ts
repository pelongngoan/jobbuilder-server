import { Schema, model, Document } from "mongoose";

export enum StaffRole {
  HR = "hr",
  INTERVIEWER = "interviewer",
  OTHER = "other",
}

export interface IStaffProfile extends Document {
  userId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  role: StaffRole;
  profile?: Schema.Types.ObjectId;
  active?: boolean;
  jobPosts?: Schema.Types.ObjectId[];
  applications?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    role: { type: String, enum: Object.values(StaffRole), required: true },
    active: { type: Boolean, default: true },
    jobPosts: [{ type: Schema.Types.ObjectId, ref: "Job", required: false }],
    applications: [
      { type: Schema.Types.ObjectId, ref: "Application", required: false },
    ],
  },
  { timestamps: true }
);

export const StaffProfile = model<IStaffProfile>(
  "StaffProfile",
  staffProfileSchema
);
