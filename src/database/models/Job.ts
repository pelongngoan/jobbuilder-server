import { Schema, model, Document, Types } from "mongoose";

export interface IOtherField {
  title: string;
  content: string;
}

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: number;
  jobType: "full-time" | "part-time" | "contract" | "internship";
  postedBy: Types.ObjectId;
  applicants: Types.ObjectId[];
  other?: IOtherField[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    salary: { type: Number, min: 0 }, // Prevent negative salary
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    other: {
      type: [
        {
          title: { type: String, required: true },
          content: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true } // Auto-manages `createdAt` and `updatedAt`
);

export const Job = model<IJob>("Job", jobSchema);
