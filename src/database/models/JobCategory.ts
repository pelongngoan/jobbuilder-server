import { Schema, model, Document } from "mongoose";

export interface IJobCategory extends Document {
  name: string;
  description: string;
  parentCategory?: Schema.Types.ObjectId;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobCategorySchema = new Schema<IJobCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "JobCategory",
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create slug from name before saving
jobCategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }
  next();
});

// Index for faster searches
// Removed duplicate index for name;
// Removed duplicate index for slug;

export const JobCategory = model<IJobCategory>(
  "JobCategory",
  jobCategorySchema
);
