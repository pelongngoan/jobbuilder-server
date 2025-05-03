import { Request, Response } from "express";
import { Job } from "../database/models/Job";
import { Application } from "../database/models/Application";

// 🔹 Create a Job Post (HR Only)
export const createJob = async (req: Request, res: Response) => {
  try {
    // const hrId = req.hrId;
    // const companyId = req.companyId;

    const newJob = new Job({
      ...req.body,
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", newJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Jobs
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find()
      .populate("companyId", "name")
      .populate("hrId", "email");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get a Single Job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate("companyId", "name")
      .populate("hrId", "email");

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Search Jobs with Filters
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { title, location, minSalary, maxSalary } = req.query;
    const filter: any = {};

    if (title) filter.title = { $regex: title, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (minSalary) filter.salary = { $gte: Number(minSalary) };
    if (maxSalary) filter.salary = { $lte: Number(maxSalary) };

    const jobs = await Job.find(filter);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update a Job Post (HR Only)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    const updatedJob = await Job.findByIdAndUpdate(jobId, updates, {
      new: true,
    });

    if (!updatedJob) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.status(200).json({ message: "Job updated successfully", updatedJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete a Job Post (HR Only)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Apply for a Job (User Only)
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;
    const { resumeId, coverLetter } = req.body;

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      res
        .status(400)
        .json({ message: "You have already applied for this job" });
      return;
    }

    const newApplication = new Application({
      jobId,
      userId,
      resumeId,
      coverLetter,
    });
    await newApplication.save();

    res
      .status(201)
      .json({ message: "Application submitted successfully", newApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Applications for a Job (HR Only)
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId }).populate(
      "userId",
      "name email"
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
