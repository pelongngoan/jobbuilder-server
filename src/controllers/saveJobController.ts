import { SavedJob } from "../database/models";
import { Request, Response } from "express";
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const jobId = req.params.jobId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (!jobId) {
      res.status(400).json({ message: "Job ID is required" });
      return;
    }

    const savedJob = await SavedJob.create({
      userId,
      jobId,
    });

    const populatedSavedJob = await savedJob.populate("jobId");

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: populatedSavedJob,
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteSavedJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const jobId = req.params.jobId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (!jobId) {
      res.status(400).json({ message: "Job ID is required" });
      return;
    }

    const deletedJob = await SavedJob.findOneAndDelete({
      userId,
      jobId,
    });

    if (!deletedJob) {
      res.status(404).json({ message: "Saved job not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Saved job deleted successfully",
    });
  } catch (error) {
    console.error("Delete saved job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSaveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const savedJobs = await SavedJob.find({
      userId: userId,
    })
      .populate("jobId")
      .populate("userId")
      .populate({ path: "jobId", populate: { path: "companyId" } });

    res.status(200).json({
      success: true,
      message: "Saved jobs retrieved successfully",
      data: savedJobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
