import { Schema, model, Document } from "mongoose";

export interface IHRProfile extends Document {
  userId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  position?: string;
  department?: string;
  jobPosts?: Schema.Types.ObjectId[];
  managedApplications?: Schema.Types.ObjectId[];
  permissions?: {
    canPostJobs: boolean;
    canManageApplications: boolean;
    canAddHRMembers: boolean;
    canEditCompanyProfile: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const hrProfileSchema = new Schema<IHRProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
    position: { type: String, default: "HR Manager" },
    department: { type: String, default: "Human Resources" },
    jobPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    managedApplications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    permissions: {
      canPostJobs: { type: Boolean, default: true },
      canManageApplications: { type: Boolean, default: true },
      canAddHRMembers: { type: Boolean, default: false },
      canEditCompanyProfile: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
// Removed duplicate index for userId;
hrProfileSchema.index({ companyId: 1 });

export const HRProfile = model<IHRProfile>("HRProfile", hrProfileSchema);
