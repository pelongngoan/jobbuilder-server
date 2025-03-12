import { Schema, model, Document } from "mongoose";

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: "generated" | "uploaded"; // Whether the resume is created via a template or uploaded as a file
  fileUrl?: string; // If the resume is uploaded, store the file URL
  content?: Record<string, any>; // JSON content for generated resumes
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
    fileUrl: { type: String, default: "" }, // Store PDF file URL if uploaded
    content: { type: Schema.Types.Mixed, default: {} }, // JSON-based content for generated resumes
  },
  { timestamps: true }
);

export const Resume = model<IResume>("Resume", resumeSchema);
