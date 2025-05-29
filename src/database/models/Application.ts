import { Schema, model, Document } from "mongoose";

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  SHORTLISTED = "shortlisted",
  INTERVIEW = "interview",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface IApplication extends Document {
  userId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  resumeId: Schema.Types.ObjectId;
  status: ApplicationStatus;
  interviewerId?: Schema.Types.ObjectId;
  interviewDate?: Date;
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    interviewerId: { type: Schema.Types.ObjectId, ref: "StaffProfile" },
    interviewDate: { type: Date },
  },
  { timestamps: { createdAt: "appliedAt", updatedAt: true } }
);

// Indexes for faster queries
applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });

export const Application = model<IApplication>(
  "Application",
  applicationSchema
);
