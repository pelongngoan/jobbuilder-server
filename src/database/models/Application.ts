import { Schema, model, Document } from "mongoose";

export interface IApplication extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  resumeId: Schema.Types.ObjectId;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who applied
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true }, // Job being applied for
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true }, // Resume used for application
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    }, // Application status
  },
  { timestamps: { createdAt: "appliedAt", updatedAt: true } } // Custom timestamp for applied date
);

export const Application = model<IApplication>(
  "Application",
  applicationSchema
);
