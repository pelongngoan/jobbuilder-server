import { Schema, model, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Technical",
        "Soft Skills",
        "Languages",
        "Tools",
        "Frameworks",
        "Other",
      ],
    },
    description: {
      type: String,
      default: "",
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster searches
skillSchema.index({ name: 1, category: 1 });

export const Skill = model<ISkill>("Skill", skillSchema);
