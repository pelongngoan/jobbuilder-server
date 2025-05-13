import { Schema, model, Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  savedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedJob = model<ISavedJob>("SavedJob", savedJobSchema);
