import { Schema, model, Document } from "mongoose";

export interface ISchool extends Document {
  name: string;
  location: string;
  website: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    website: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const School = model<ISchool>("School", schoolSchema);
