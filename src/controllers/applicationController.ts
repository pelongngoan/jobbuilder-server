import { Request, Response } from "express";
import { Application } from "../database/models/Application";
import { Job } from "../database/models/Job";
import { Resume } from "../database/models/Resume";

// 🔹 Apply for a Job (User Only)
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;
    const { resumeId, coverLetter } = req.body;

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    // Check if the resume exists
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(400).json({ message: "Invalid resume" });
      return;
    }

    // Check if the user has already applied for this job
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      res
        .status(400)
        .json({ message: "You have already applied for this job" });
      return;
    }

    // Create the application
    const newApplication = new Application({
      jobId,
      userId,
      resumeId,
      coverLetter,
      status: "pending",
    });

    await newApplication.save();
    res
      .status(201)
      .json({ message: "Application submitted successfully", newApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a User
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const applications = await Application.find({ userId })
      .populate("jobId", "title companyId")
      .populate("resumeId", "title");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get a Specific Application by ID (User & HR)
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate("jobId", "title companyId")
      .populate("resumeId", "title");

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a Job (HR Only)
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate("userId", "name email")
      .populate("resumeId", "title");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Application Status (HR Only)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["pending", "shortlisted", "rejected", "accepted"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Application status updated", updatedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete an Application (User Only)
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    await Application.findByIdAndDelete(applicationId);
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
