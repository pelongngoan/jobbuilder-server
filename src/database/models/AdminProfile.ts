import { Schema, model, Document } from "mongoose";

export interface IAdminProfile extends Document {
  userId: Schema.Types.ObjectId;
  adminLevel: "super" | "standard" | "limited";
  permissions: {
    canManageUsers: boolean;
    canManageCompanies: boolean;
    canManageJobs: boolean;
    canManageSkills: boolean;
    canManageCategories: boolean;
    canAccessLogs: boolean;
    canManageSettings: boolean;
  };
  lastAction?: {
    type: string;
    description: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const adminProfileSchema = new Schema<IAdminProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    adminLevel: {
      type: String,
      enum: ["super", "standard", "limited"],
      default: "limited",
      required: true,
    },
    permissions: {
      canManageUsers: { type: Boolean, default: true },
      canManageCompanies: { type: Boolean, default: true },
      canManageJobs: { type: Boolean, default: true },
      canManageSkills: { type: Boolean, default: true },
      canManageCategories: { type: Boolean, default: true },
      canAccessLogs: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
    },
    lastAction: {
      type: { type: String },
      description: { type: String },
      timestamp: { type: Date },
    },
  },
  { timestamps: true }
);

// Set default permissions based on admin level
adminProfileSchema.pre("save", function (next) {
  if (this.isModified("adminLevel")) {
    if (this.adminLevel === "super") {
      this.permissions = {
        canManageUsers: true,
        canManageCompanies: true,
        canManageJobs: true,
        canManageSkills: true,
        canManageCategories: true,
        canAccessLogs: true,
        canManageSettings: true,
      };
    } else if (this.adminLevel === "standard") {
      this.permissions = {
        canManageUsers: true,
        canManageCompanies: true,
        canManageJobs: true,
        canManageSkills: true,
        canManageCategories: true,
        canAccessLogs: false,
        canManageSettings: false,
      };
    } else {
      // limited admin
      this.permissions = {
        canManageUsers: false,
        canManageCompanies: false,
        canManageJobs: true,
        canManageSkills: true,
        canManageCategories: true,
        canAccessLogs: false,
        canManageSettings: false,
      };
    }
  }
  next();
});

// Indexes for faster queries
// Removed duplicate index for userId;
adminProfileSchema.index({ adminLevel: 1 });

export const AdminProfile = model<IAdminProfile>(
  "AdminProfile",
  adminProfileSchema
);
