import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IHR extends Document {
  companyId: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  position?: string;
  phone?: string;
  jobPosts: Schema.Types.ObjectId[]; // References Job posts created by HR
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const hrSchema = new Schema<IHR>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }, // Links HR to a company
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    position: { type: String, default: "" }, // HR position in the company
    phone: { type: String, default: "" }, // Contact number
    jobPosts: [{ type: Schema.Types.ObjectId, ref: "Job" }], // Jobs managed by HR
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
hrSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Compare password method
hrSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const HR = model<IHR>("HR", hrSchema);
