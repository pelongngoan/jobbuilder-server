import { Schema, model, Document, Types } from "mongoose";

export interface ICompany extends Document {
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  recruiter: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    industry: { type: String },
    location: { type: String },
    website: { type: String },
    description: { type: String },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Company = model<ICompany>("Company", companySchema);
