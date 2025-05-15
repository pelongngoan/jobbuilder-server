import { Schema, model, Document } from "mongoose";

export interface IJob extends Document {
  companyId: Schema.Types.ObjectId;
  hrId: Schema.Types.ObjectId;
  title: string;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "remote";
  description: string;
  salaryFrom: number;
  salaryTo: number;
  salaryCurrency: string;
  benefits?: string[];
  category?: Schema.Types.ObjectId;
  skills?: string[];
  status?: "open" | "closed" | "draft";
  deadline?: Date;
  requirements?: string[];
  contacter: Schema.Types.ObjectId;
  keyResponsibilities?: string[];
  applications: Schema.Types.ObjectId[];
  experienceLevel?: "Entry" | "Mid" | "Senior" | "Executive";
  other?: { title?: string; description?: string; [key: string]: any };
  viewCount: number;
  applicationCount: number;
  isFeatured: boolean;
  slug: string;
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
    salaryCurrency: { type: String, required: true },
    salaryFrom: { type: Number, required: true },
    salaryTo: { type: Number, required: true },
    description: { type: String, required: true },
    keyResponsibilities: [{ type: String, required: false }],
    benefits: [{ type: String, required: false }],
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    deadline: { type: Date, required: false },
    requirements: [{ type: String, required: false }],
    contacter: {
      type: Schema.Types.ObjectId,
      ref: "StaffProfile",
      required: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "JobCategory",
      required: false,
    },
    skills: [{ type: String, required: false }],
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
    other: {
      title: { type: String, required: false },
      description: { type: String, required: false },
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Executive"],
      required: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
jobSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "") +
      "-" +
      Date.now().toString().slice(-4);
  }
  next();
});

// Indexes for faster searches
jobSchema.index({ companyId: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index(
  {
    title: "text",
    description: "text",
    keyResponsibilities: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      keyResponsibilities: 3,
    },
  }
);

export const Job = model<IJob>("Job", jobSchema);
