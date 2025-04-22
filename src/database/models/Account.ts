import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IAccount extends Document {
  email: string;
  password: string;
  isVerified: boolean;
  role: "admin" | "hr" | "company";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const accountSchema = new Schema<IAccount>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "hr", "company"],
      required: true,
    },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Compare password method
accountSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Account = model<IAccount>("Account", accountSchema);
