import { Schema, model, Document, Model } from "mongoose";

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: "generated" | "uploaded"; // Whether the resume is created via a template or uploaded as a file
  fileUrl?: string; // If the resume is uploaded, store the file URL
  isDefault?: boolean;
  skills?: Schema.Types.ObjectId[]; // Reference to Skill documents
  content?: {
    personalInfo?: {
      fullName: string;
      email: string;
      phone?: string;
      address?: string;
      linkedin?: string;
      website?: string;
    };
    summary?: string;
    workExperience?: {
      company: string;
      position: string;
      location?: string;
      startDate?: Date;
      endDate?: Date;
      current?: boolean;
      description?: string;
      highlights?: string[];
    }[];
    education?: {
      institution: string;
      degree?: string;
      field?: string;
      location?: string;
      startDate?: Date;
      endDate?: Date;
      current?: boolean;
      gpa?: string;
      highlights?: string[];
    }[];
    skills?: {
      category?: string;
      items: string[];
    }[];
    certifications?: {
      name: string;
      issuer?: string;
      date?: Date;
      url?: string;
    }[];
    languages?: {
      language: string;
      proficiency?: string;
    }[];
    projects?: {
      name: string;
      description?: string;
      url?: string;
      technologies?: string[];
      highlights?: string[];
    }[];
    references?: {
      name: string;
      position?: string;
      company?: string;
      email?: string;
      phone?: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Resume belongs to a user
    title: { type: String, required: true, trim: true }, // Resume name (e.g., "Software Engineer Resume")
    type: {
      type: String,
      enum: ["generated", "uploaded"],
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    fileUrl: { type: String, default: "" }, // Store PDF file URL if uploaded
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }], // Reference to Skill documents
    content: {
      personalInfo: {
        fullName: { type: String },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        linkedin: { type: String },
        website: { type: String },
      },
      summary: { type: String },
      workExperience: [
        {
          company: { type: String },
          position: { type: String },
          location: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          current: { type: Boolean, default: false },
          description: { type: String },
          highlights: [{ type: String }],
        },
      ],
      education: [
        {
          institution: { type: String },
          degree: { type: String },
          field: { type: String },
          location: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          current: { type: Boolean, default: false },
          gpa: { type: String },
          highlights: [{ type: String }],
        },
      ],
      skills: [
        {
          category: { type: String },
          items: [{ type: String }],
        },
      ],
      certifications: [
        {
          name: { type: String },
          issuer: { type: String },
          date: { type: Date },
          url: { type: String },
        },
      ],
      languages: [
        {
          language: { type: String },
          proficiency: { type: String },
        },
      ],
      projects: [
        {
          name: { type: String },
          description: { type: String },
          url: { type: String },
          technologies: [{ type: String }],
          highlights: [{ type: String }],
        },
      ],
      references: [
        {
          name: { type: String },
          position: { type: String },
          company: { type: String },
          email: { type: String },
          phone: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

// Ensure only one default resume per user
resumeSchema.pre("save", async function (next) {
  if (this.isDefault === true) {
    const ResumeModel = this.constructor as Model<IResume>;
    await ResumeModel.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Indexes for faster queries
resumeSchema.index({ userId: 1 });
resumeSchema.index({ type: 1 });
resumeSchema.index({ isDefault: 1 });

export const Resume = model<IResume>("Resume", resumeSchema);
