import { Schema, model, Document, Model } from "mongoose";

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: "generated" | "uploaded";
  fileUrl?: string;
  isDefault?: boolean;
  content?: {
    personalInfo?: {
      fullName: string;
      email: string;
      phone?: string;
      address?: string;
      other?: { [key: string]: any };
    };
    summary?: string;
    workExperience?: {
      company: string;
      position: string;
      location?: string;
      startDate?: Date;
      endDate?: Date;
      current?: boolean;
      other?: { [key: string]: any };
    }[];
    education?: {
      startDate?: Date;
      endDate?: Date;
      current?: boolean;
      schoolId?: Schema.Types.ObjectId;
      degree?: string;
      field?: string;
      gpa?: string;
      other?: { [key: string]: any };
    }[];
    skills?: {
      category: string;
      items: string[];
    }[];
    certifications?: {
      name: string;
      date?: Date;
      url?: string;
      issuer?: string;
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
      other?: { [key: string]: any };
    }[];
    references?: {
      name: string;
      position: string;
      company: string;
      email: string;
      phone: string;
    }[];
    other?: { title?: string; description?: string; [key: string]: any };
  };
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["generated", "uploaded"],
      required: true,
    },
    fileUrl: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    content: {
      personalInfo: {
        fullName: { type: String },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        other: { type: Object },
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
          other: { type: Object },
        },
      ],
      education: [
        {
          schoolId: { type: Schema.Types.ObjectId, ref: "School" },
          degree: { type: String },
          field: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          current: { type: Boolean, default: false },
          gpa: { type: String },
          other: { type: Object },
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
          other: { type: Object },
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
      other: { type: Object },
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
