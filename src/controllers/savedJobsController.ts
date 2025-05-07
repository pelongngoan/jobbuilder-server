import { Request, Response } from "express";
import { SavedJob } from "../database/models/SavedJobs";
import { Job } from "../database/models/Job";

// 🔹 Save a job
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({ userId, jobId });
    if (existingSavedJob) {
      res.status(400).json({
        success: false,
        message: "Job already saved",
      });
      return;
    }

    // Create new saved job
    const savedJob = new SavedJob({
      userId,
      jobId,
    });

    await savedJob.save();

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: savedJob,
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get all saved jobs for a user
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const savedJobs = await SavedJob.find({ userId })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "jobId",
        populate: [
          { path: "category", select: "name" },
          { path: "skills", select: "name category" },
        ],
      });

    const total = await SavedJob.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: savedJobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Check if a job is saved
export const checkIfJobSaved = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({ userId, jobId });

    res.status(200).json({
      success: true,
      isSaved: !!savedJob,
      data: savedJob,
    });
  } catch (error) {
    console.error("Check saved job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Remove a saved job
export const removeSavedJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    const result = await SavedJob.findOneAndDelete({ userId, jobId });

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    console.error("Remove saved job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
