import { Schema, model, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: Schema.Types.ObjectId;
  headline?: string;
  bio?: string;
  skills?: Schema.Types.ObjectId[];
  savedJobs?: Schema.Types.ObjectId[];
  resumes?: Schema.Types.ObjectId[];
  applications?: Schema.Types.ObjectId[];
  preferredCategories?: Schema.Types.ObjectId[];
  preferredLocations?: string[];
  jobSearchPreferences?: {
    jobType?: string[];
    salaryRange?: string;
    remoteOnly?: boolean;
    availableForHire?: boolean;
  };
  experience?: {
    company: string;
    role: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    location?: string;
  }[];
  education?: {
    institution: string;
    degree?: string;
    field?: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuer?: string;
    issueDate?: Date;
    expirationDate?: Date;
    credentialId?: string;
    url?: string;
  }[];
  socialMedia?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
    other?: string;
  };
  portfolioProjects?: {
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    technologies?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    resumes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Resume",
      },
    ],
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    preferredCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "JobCategory",
      },
    ],
    preferredLocations: [{ type: String }],
    jobSearchPreferences: {
      jobType: [
        {
          type: String,
          enum: ["full-time", "part-time", "contract", "internship", "remote"],
        },
      ],
      salaryRange: { type: String },
      remoteOnly: { type: Boolean, default: false },
      availableForHire: { type: Boolean, default: true },
    },
    experience: [
      {
        company: String,
        role: String,
        description: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        location: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expirationDate: Date,
        credentialId: String,
        url: String,
      },
    ],
    socialMedia: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String,
      other: String,
    },
    portfolioProjects: [
      {
        title: String,
        description: String,
        url: String,
        imageUrl: String,
        technologies: [String],
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
// Removed duplicate index for userId;
userProfileSchema.index({ skills: 1 });
userProfileSchema.index({ preferredCategories: 1 });

export const UserProfile = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);
