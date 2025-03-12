import { Schema, model, Document } from "mongoose";

export interface IJob extends Document {
  companyId: Schema.Types.ObjectId;
  hrId: Schema.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  salaryRange?: string;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "remote";
  category: string;
  applications: Schema.Types.ObjectId[]; // References applications for this job
  other?: { title?: string; description?: string; [key: string]: any }; // Dynamic object for extra details
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    hrId: { type: Schema.Types.ObjectId, ref: "HR", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String, required: true }],
    salaryRange: { type: String, default: "" },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    category: { type: String, required: true },
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
    other: {
      type: Map, // Allows dynamic key-value pairs
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

export const Job = model<IJob>("Job", jobSchema);
