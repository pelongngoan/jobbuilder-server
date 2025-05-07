import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../database/models/User";
import { UserProfile } from "../database/models/UserProfile";
import { Settings } from "../database/models/Settings";
import { Resume } from "../database/models/Resume";
import { getRelativeFilePath } from "../utils/fileUpload";

dotenv.config();

// Add interface declarations for education and experience with _id property
interface Education {
  _id: any;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
}

interface Experience {
  _id: any;
  company: string;
  role: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  location?: string;
}

// Extend UserProfile interface to include typed arrays
interface IUserProfile {
  education: Education[];
  experience: Experience[];
  // other fields...
}

// Middleware to verify JWT Token (for protected routes)
export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

// 🔹 Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const userProfile = await UserProfile.findOne({ userId })
      .populate("skills")
      .populate("preferredCategories")
      .populate("applications")
      .populate("resumes");

    if (!userProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user,
      profile: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
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

    // Update the user profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: profileUpdates },
      { new: true }
    );

    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Add Education to Profile
export const addEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const education = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { education } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      message: "Education added successfully",
      profile,
    });
  } catch (error) {
    console.error("Add education error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Education
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { educationId } = req.params;
    const updates = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const educationIndex = profile.education.findIndex(
      (edu: any) => edu._id.toString() === educationId
    );

    if (educationIndex === -1) {
      res.status(404).json({ message: "Education entry not found" });
      return;
    }

    for (const key in updates) {
      profile.education[educationIndex][key] = updates[key];
    }

    await profile.save();

    res.status(200).json({
      message: "Education updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update education error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete Education
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { educationId } = req.params;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const educationIndex = profile.education.findIndex(
      (edu: any) => edu._id.toString() === educationId
    );

    if (educationIndex === -1) {
      res.status(404).json({ message: "Education entry not found" });
      return;
    }

    profile.education.splice(educationIndex, 1);
    await profile.save();

    res.status(200).json({
      message: "Education deleted successfully",
      profile,
    });
  } catch (error) {
    console.error("Delete education error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Add Experience to Profile
export const addExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const experience = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { experience } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      message: "Experience added successfully",
      profile,
    });
  } catch (error) {
    console.error("Add experience error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Experience
export const updateExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { experienceId } = req.params;
    const updates = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const experienceIndex = profile.experience.findIndex(
      (exp: any) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      res.status(404).json({ message: "Experience entry not found" });
      return;
    }

    for (const key in updates) {
      profile.experience[experienceIndex][key] = updates[key];
    }

    await profile.save();

    res.status(200).json({
      message: "Experience updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update experience error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete Experience
export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { experienceId } = req.params;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const experienceIndex = profile.experience.findIndex(
      (exp: any) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      res.status(404).json({ message: "Experience entry not found" });
      return;
    }

    profile.experience.splice(experienceIndex, 1);
    await profile.save();

    res.status(200).json({
      message: "Experience deleted successfully",
      profile,
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get User Settings
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({
        userId,
        emailNotifications: true,
        jobAlerts: true,
        theme: "light",
        language: "en",
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Get user settings error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update User Settings
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const settings = await Settings.findOneAndUpdate({ userId }, updates, {
      new: true,
      upsert: true,
    });

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update user settings error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete User Account
export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    // Validate input
    if (!password) {
      res
        .status(400)
        .json({ message: "Password is required for verification" });
      return;
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Password is incorrect" });
      return;
    }

    // Delete user profile data first
    await UserProfile.findOneAndDelete({ userId });
    await Settings.findOneAndDelete({ userId });
    // Add other related collections to delete, like applications, resumes, etc.

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Create Resume
export const createResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      title,
      type,
      content,
      skills,
      education,
      experience,
      isDefault,
      fileUrl,
    } = req.body;

    // Create resume
    const resume = new Resume({
      userId,
      title,
      type,
      fileUrl,
      content,
      skills: skills ? skills : [],
      education,
      experience,
      isDefault,
    });

    await resume.save();

    // If this resume is set as default, update any other default resumes
    if (isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    // Add resume to user profile
    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Create resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get All User Resumes
export const getUserResumes = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get resumes without population first
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error("Get user resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get Resume by ID
export const getResumeById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    // Find resume without population first
    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Update Resume
export const updateResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const updates = req.body;

    // Check if the resume belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    // If setting as default, update other resumes
    if (updates.isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resumeId }, isDefault: true },
        { isDefault: false }
      );
    }

    // Update resume
    const updatedResume = await Resume.findByIdAndUpdate(resumeId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: updatedResume,
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Delete Resume
export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    // Check if the resume belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    // Delete the resume
    await Resume.findByIdAndDelete(resumeId);

    // Remove from user profile
    await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { resumes: resumeId } }
    );

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Upload Resume File
export const uploadResumeFile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, isDefault } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    // Get relative file path for storage in DB
    const fileUrl = getRelativeFilePath(file.path);

    // Create resume
    const resume = new Resume({
      userId,
      title: title || file.originalname,
      type: "uploaded", // Set type to uploaded for file uploads
      fileUrl,
      isDefault: isDefault === "true" || isDefault === true,
    });

    await resume.save();

    // If this resume is set as default, update any other default resumes
    if (resume.isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    // Add resume to user profile
    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume file uploaded successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Upload resume file error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
