import { Schema, model, Document } from "mongoose";

export interface IApplication extends Document {
  userId: Schema.Types.ObjectId;
  jobId: Schema.Types.ObjectId;
  resumeId: Schema.Types.ObjectId;
  coverLetter?: string;
  status:
    | "pending"
    | "reviewed"
    | "shortlisted"
    | "interview"
    | "accepted"
    | "rejected";
  feedback?: string;
  interview?: {
    scheduledFor?: Date;
    location?: string;
    isOnline?: boolean;
    meetingLink?: string;
    interviewers?: string[];
    notes?: string;
    interviewType?: "phone" | "technical" | "behavioral" | "final";
    round?: number;
  };
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who applied
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true }, // Job being applied for
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true }, // Resume used for application
    coverLetter: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
      ],
      default: "pending",
    }, // Application status
    feedback: {
      type: String,
      default: "",
    },
    interview: {
      scheduledFor: { type: Date },
      location: { type: String },
      isOnline: { type: Boolean, default: false },
      meetingLink: { type: String },
      interviewers: [{ type: String }],
      notes: { type: String },
      interviewType: {
        type: String,
        enum: ["phone", "technical", "behavioral", "final"],
      },
      round: { type: Number, default: 1 },
    },
  },
  { timestamps: { createdAt: "appliedAt", updatedAt: true } } // Custom timestamp for applied date
);

// Indexes for faster queries
applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ "interview.scheduledFor": 1 });

export const Application = model<IApplication>(
  "Application",
  applicationSchema
);
