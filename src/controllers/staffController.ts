import { Request, Response } from "express";
import { Job, Profile, StaffProfile } from "../database/models";

export const getHRProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const hrProfile = await StaffProfile.findOne({ userId })
      .populate("companyId")
      .populate("profile")
      .populate("jobPosts")
      .populate("applications");

    if (!hrProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    res.status(200).json({
      success: true,
      data: hrProfile,
    });
  } catch (error) {
    console.error("Get HR profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
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

    const userProfile = await StaffProfile.findOneAndUpdate(
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
export const createJob = async (req: Request, res: Response) => {
  try {
    const staffId = req.staffProfileId;
    const {
      title,
      location,
      jobType,
      description,
      salaryFrom,
      salaryTo,
      salaryCurrency,
      benefits,
      category,
      skills,
      status,
      deadline,
      requirements,
      contacter,
      keyResponsibilities,
      experienceLevel,
      isFeatured,
      other,
    } = req.body;
    if (
      !title ||
      !description ||
      !salaryFrom ||
      !salaryTo ||
      !salaryCurrency ||
      !location ||
      !jobType ||
      !category ||
      !skills ||
      !status ||
      !deadline ||
      !requirements ||
      !contacter ||
      !keyResponsibilities ||
      !experienceLevel ||
      !isFeatured
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const staffProfile = await StaffProfile.findById(staffId);
    const contacterProfile = await StaffProfile.findById(contacter);
    if (!contacterProfile) {
      res.status(404).json({ message: "Contacter profile not found" });
      return;
    }
    if (contacterProfile.role !== "hr") {
      res.status(403).json({ message: "Contacter must be an HR" });
      return;
    }
    if (!staffProfile) {
      res.status(404).json({ message: "Staff profile not found" });
      return;
    }
    if (staffProfile.role !== "hr") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    await Job.create({
      title,
      description,
      salaryFrom,
      salaryTo,
      salaryCurrency,
      benefits,
      category,
      skills,
      status,
      deadline,
      requirements,
      contacter,
      keyResponsibilities,
      experienceLevel,
      isFeatured,
      other,
    });
    res.status(201).json({
      success: true,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateJob = async (req: Request, res: Response) => {
  try {
    const staffId = req.staffProfileId;
    const { jobId } = req.params;
    const {
      title,
      location,
      jobType,
      description,
      salaryFrom,
      salaryTo,
      salaryCurrency,
      benefits,
      category,
      skills,
      status,
      deadline,
      requirements,
      contacter,
      keyResponsibilities,
      experienceLevel,
      isFeatured,
      other,
    } = req.body;
    if (
      !title ||
      !description ||
      !salaryFrom ||
      !salaryTo ||
      !salaryCurrency ||
      !location ||
      !jobType ||
      !category ||
      !skills ||
      !status ||
      !deadline ||
      !requirements ||
      !contacter ||
      !keyResponsibilities ||
      !experienceLevel ||
      !isFeatured
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const staffProfile = await StaffProfile.findById(staffId);
    const contacterProfile = await StaffProfile.findById(contacter);
    if (!contacterProfile) {
      res.status(404).json({ message: "Contacter profile not found" });
      return;
    }
    if (contacterProfile.role !== "hr") {
      res.status(403).json({ message: "Contacter must be an HR" });
      return;
    }
    if (!staffProfile) {
      res.status(404).json({ message: "Staff profile not found" });
      return;
    }
    if (staffProfile.role !== "hr") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const job = await Job.findByIdAndUpdate(jobId, {
      title,
      location,
      jobType,
      description,
      salaryFrom,
      salaryTo,
      salaryCurrency,
      benefits,
      category,
      skills,
      status,
      deadline,
      requirements,
      contacter,
      keyResponsibilities,
      experienceLevel,
      isFeatured,
      other,
    });
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
