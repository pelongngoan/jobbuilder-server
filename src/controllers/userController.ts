import { Request, Response } from "express";
import dotenv from "dotenv";
import { UserProfile } from "../database/models/UserProfile";
import { Resume } from "../database/models/Resume";
import { getRelativeFilePath } from "../utils/fileUpload";
import { Profile } from "../database/models/Profile";
import { School } from "../database/models/School";
import { Job } from "../database/models/Job";

dotenv.config();

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, phone, profilePicture, address } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !profilePicture ||
      !address
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingProfile = await Profile.findOne({ userId });

    if (existingProfile) {
      res.status(400).json({ message: "Profile already exists" });
      return;
    }

    const profile = await Profile.create({
      userId,
      firstName,
      lastName,
      email,
      phone,
      profilePicture,
      address,
    });

    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { profile: profile._id },
      { new: true }
    );
    if (!userProfile) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("Create profile error:", error);
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, phone, profilePicture, address } =
      req.body;

    const profile = await Profile.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      email,
      phone,
      profilePicture,
      address,
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const userProfile = await UserProfile.findOne({
      userId,
    })
      .populate("profile")
      .populate("applications")
      .populate("savedJobs")
      .populate("resumes")
      .populate("userId");
    console.log(userProfile.profile);

    if (!userProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { savedJobs: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { savedJobs: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job unsaved successfully",
    });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { applications: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Applied to job successfully",
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const removeApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { applications: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Application removed successfully",
    });
  } catch (error) {
    console.error("Remove application error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const addEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { educationId } = req.params;

    const education = await School.findById(educationId);
    if (!education) {
      res.status(404).json({ message: "Education not found" });
      return;
    }
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { education: educationId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Education added successfully",
    });
  } catch (error) {
    console.error("Update education error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const removeEducation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { educationId } = req.params;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { education: educationId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Education removed successfully",
    });
  } catch (error) {
    console.error("Remove education error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const createResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, isDefault, content } = req.body;

    const resume = new Resume({
      userId,
      title,
      type: "generated",
      content,
      isDefault,
    });

    await resume.save();

    if (isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
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

    const fileUrl = getRelativeFilePath(file.path);

    const resume = new Resume({
      userId,
      title: title || file.originalname,
      type: "uploaded",
      fileUrl,
      isDefault: isDefault === "true" || isDefault === true,
    });

    await resume.save();

    if (resume.isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume file uploaded successfully",
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
