import { Schema, model, Document } from "mongoose";

export interface ICompanyProfile extends Document {
  userId: Schema.Types.ObjectId;
  companyName: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  foundingYear?: number;
  companyValues?: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  benefits?: string[];
  hrMembers?: Schema.Types.ObjectId[];
  jobPosts?: Schema.Types.ObjectId[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
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
      required: true,
      trim: true,
    },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      default: "1-10",
    },
    foundingYear: {
      type: Number,
      validate: {
        validator: function (v: number) {
          return v > 1800 && v <= new Date().getFullYear();
        },
        message: (props) => `${props.value} is not a valid founding year!`,
      },
    },
    companyValues: [{ type: String }],
    socialMedia: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    benefits: [{ type: String }],
    hrMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    jobPosts: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Create slug from company name before saving
companyProfileSchema.pre("save", function (next) {
  if (this.isModified("companyName")) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }
  next();
});

// Indexes for faster queries
// Removed duplicate index for userId;
// Removed duplicate index for slug;
companyProfileSchema.index({ industry: 1 });
companyProfileSchema.index(
  {
    companyName: "text",
    description: "text",
  },
  {
    weights: {
      companyName: 10,
      description: 5,
    },
  }
);

export const CompanyProfile = model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema
);
