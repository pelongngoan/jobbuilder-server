import { Schema, model, Document, Types } from "mongoose";

export interface IApplication extends Document {
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  resume?: string;
  coverLetter?: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: String },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Application = model<IApplication>(
  "Application",
  applicationSchema
);
