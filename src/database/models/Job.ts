import { Schema, model, Document } from "mongoose";

export interface IJob extends Document {
  companyId: Schema.Types.ObjectId;
  hrId: Schema.Types.ObjectId;
  title: string;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salaryRange?: string;
  salaryCurrency: string;
  salaryType?: "hourly" | "monthly" | "yearly";
  description: string;
  keyResponsibilities?: string[];
  benefits?: string[];
  category?: string;
  status?: "open" | "closed";
  deadline?: Date;
  requirements?: string[];
  contactEmail?: string;
  contactPhone?: string;
  logoCompany?: string;
  companyName?: string;
  companyWebsite?: string;
  applications: Schema.Types.ObjectId[];
  other?: { title?: string; description?: string; [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    hrId: { type: Schema.Types.ObjectId, ref: "HR", required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    salaryRange: { type: String, required: false },
    salaryCurrency: { type: String, required: true },
    salaryType: {
      type: String,
      enum: ["hourly", "monthly", "yearly"],
      required: false,
    },
    description: { type: String, required: true },
    keyResponsibilities: [{ type: String, required: false }],
    benefits: [{ type: String, required: false }],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    deadline: { type: Date, required: false },
    requirements: [{ type: String, required: false }],
    contactEmail: { type: String, required: false },
    contactPhone: { type: String, required: false },
    logoCompany: { type: String, required: false },
    companyName: { type: String, required: false },
    companyWebsite: { type: String, required: false },
    category: { type: String, required: false },
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
    other: {
      title: { type: String, required: false },
      description: { type: String, required: false },
    },
  },
  { timestamps: true }
);

export const Job = model<IJob>("Job", jobSchema);
