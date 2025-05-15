import { Schema, model, Document } from "mongoose";

export interface ICompanyProfile extends Document {
  userId: Schema.Types.ObjectId;
  companyName?: string;
  email?: string;
  logo?: string;
  wallPaper?: string;
  website?: string;
  description?: string;
  address?: string;
  phone?: string;
  domain?: string;
  // hrMembers?: Schema.Types.ObjectId[];
  // jobPosts?: Schema.Types.ObjectId[];
  // applications?: Schema.Types.ObjectId[];
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    email: { type: String, default: "" },
    domain: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    wallPaper: { type: String, default: "" },
    // hrMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // jobPosts: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    // applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

companyProfileSchema.pre("save", function (next) {
  if (this.isModified("companyName")) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }
  next();
});

companyProfileSchema.index({ userId: 1 });
companyProfileSchema.index({ slug: 1 });

export const CompanyProfile = model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema
);
