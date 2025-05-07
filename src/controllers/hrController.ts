import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../database/models/User";
import { HRProfile } from "../database/models/HRProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";

dotenv.config();

// Generate JWT Token
const generateToken = (hrId: string) => {
  return jwt.sign({ hrId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// 🔹 Get HR Profile
export const getHRProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const hrProfile = await HRProfile.findOne({ userId })
      .populate("companyId")
      .populate("jobPosts")
      .populate("managedApplications");

    if (!hrProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
      profile: hrProfile,
    });
  } catch (error) {
    console.error("Get HR profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update HR Profile
export const updateHRProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Update user basic info if provided
    if (
      req.body.name ||
      req.body.email ||
      req.body.phone ||
      req.body.location ||
      req.body.profilePicture
    ) {
      const userUpdates: any = {};

      if (req.body.name) userUpdates.name = req.body.name;
      if (req.body.email) userUpdates.email = req.body.email;
      if (req.body.phone) userUpdates.phone = req.body.phone;
      if (req.body.location) userUpdates.location = req.body.location;
      if (req.body.profilePicture)
        userUpdates.profilePicture = req.body.profilePicture;

      await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Prepare profile updates by removing user properties
    const profileUpdates = { ...req.body };
    [
      "name",
      "email",
      "phone",
      "location",
      "profilePicture",
      "password",
    ].forEach((key) => {
      delete profileUpdates[key];
    });

    // Update the HR profile
    const updatedProfile = await HRProfile.findOneAndUpdate(
      { userId },
      { $set: profileUpdates },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "HR profile updated successfully",
      user,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update HR profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Add HR to Company
export const addHRToCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { email, permissions, name, password, position, department } =
      req.body;

    // Check if company exists
    const company = await CompanyProfile.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate name from email if not provided
    const generatedName = name || email.split("@")[0];

    // Generate random password if not provided
    const generatedPassword = password || Math.random().toString(36).slice(-10);

    // Create new user with HR role
    const newUser = new User({
      name: generatedName,
      email,
      password: generatedPassword,
      role: "hr",
    });
    await newUser.save();

    // Parse permissions array into HR permissions object
    const hrPermissions = {
      canPostJobs: permissions?.includes("manage_jobs") || false,
      canManageApplications:
        permissions?.includes("manage_applications") || false,
      canAddHRMembers: permissions?.includes("manage_hr") || false,
      canEditCompanyProfile: permissions?.includes("edit_company") || false,
    };

    // Create HR profile
    const newHRProfile = new HRProfile({
      userId: newUser._id,
      companyId,
      position: position || "HR Manager",
      department: department || "Human Resources",
      permissions: hrPermissions,
    });
    await newHRProfile.save();

    // Add HR to company's HR members
    await CompanyProfile.findByIdAndUpdate(companyId, {
      $push: { hrMembers: newUser._id },
    });

    res.status(201).json({
      message: "HR added to company successfully",
      hr: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        profile: newHRProfile,
      },
      // Only return the generated password in development
      ...(process.env.NODE_ENV !== "production" && { generatedPassword }),
    });
  } catch (error) {
    console.error("Add HR to company error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Company HRs
export const getCompanyHRs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Check if company exists
    const company = await CompanyProfile.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get all HR profiles for this company
    const hrProfiles = await HRProfile.find({ companyId });

    // Get user information for each HR
    const hrList = await Promise.all(
      hrProfiles.map(async (profile) => {
        const user = await User.findById(profile.userId).select("-password");
        return {
          user,
          profile,
        };
      })
    );

    res.status(200).json(hrList);
  } catch (error) {
    console.error("Get company HRs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update HR Permissions
export const updateHRPermissions = async (req: Request, res: Response) => {
  try {
    const { hrId } = req.params;
    const permissions = req.body.permissions;

    if (!permissions) {
      return res.status(400).json({ message: "Permissions are required" });
    }

    // Find HR profile
    const hrProfile = await HRProfile.findOne({ userId: hrId });
    if (!hrProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    // Make sure requester has permission
    if (req.userRole !== "company" && req.userRole !== "admin") {
      const requesterHR = await HRProfile.findOne({ userId: req.userId });
      if (!requesterHR || !requesterHR.permissions.canAddHRMembers) {
        return res.status(403).json({
          message: "You don't have permission to update HR permissions",
        });
      }
    }

    // Update permissions
    hrProfile.permissions = {
      ...hrProfile.permissions,
      ...permissions,
    };

    await hrProfile.save();

    res.status(200).json({
      message: "HR permissions updated successfully",
      profile: hrProfile,
    });
  } catch (error) {
    console.error("Update HR permissions error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Remove HR from Company
export const removeHRFromCompany = async (req: Request, res: Response) => {
  try {
    const { hrId } = req.params;

    // Find HR profile
    const hrProfile = await HRProfile.findOne({ userId: hrId });
    if (!hrProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    const companyId = hrProfile.companyId;

    // Remove HR from company's HR members
    await CompanyProfile.findByIdAndUpdate(companyId, {
      $pull: { hrMembers: hrId },
    });

    // Delete HR profile
    await HRProfile.deleteOne({ userId: hrId });

    // Optional: Delete or update user
    // For now, we'll just update user role to regular user
    await User.findByIdAndUpdate(hrId, { role: "user" });

    res.status(200).json({ message: "HR removed from company successfully" });
  } catch (error) {
    console.error("Remove HR from company error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
