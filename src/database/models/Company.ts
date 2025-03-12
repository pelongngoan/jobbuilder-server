import { Schema, model, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  email: string;
  password: string;
  location?: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
  hrAccounts: Schema.Types.ObjectId[]; // References HR accounts
  jobPosts: Schema.Types.ObjectId[]; // References Job posts
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    location: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" }, // Can store image URL or file path
    hrAccounts: [{ type: Schema.Types.ObjectId, ref: "HR" }], // Links HR accounts
    jobPosts: [{ type: Schema.Types.ObjectId, ref: "Job" }], // Links job posts
  },
  { timestamps: true }
);

export const Company = model<ICompany>("Company", companySchema);
