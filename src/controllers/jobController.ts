import { Request, Response } from "express";
import { IJob, Job } from "../database/models/Job";
import { Application } from "../database/models/Application";
import fs from "fs";
import csv from "csv-parser";
// 🔹 Create a Job Post (HR Only)
export const createJob = async (req: Request, res: Response) => {
  try {
    const newJob = new Job({
      ...req.body,
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", newJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const uploadJobsFromCSV = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const jobs: Partial<IJob>[] = [];

  try {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        jobs.push({
          companyId: req.body.companyId,
          hrId: req.body.hrId,
          title: row.title,
          location: row.location,
          jobType: row.jobType,
          salaryRange: row.salaryRange,
          salaryCurrency: row.salaryCurrency,
          salaryType: row.salaryType,
          description: row.description,
          keyResponsibilities: row.keyResponsibilities?.split("|"),
          benefits: row.benefits?.split("|"),
          category: row.category,
          status: row.status || "open",
          deadline: row.deadline ? new Date(row.deadline) : undefined,
          requirements: row.requirements?.split("|"),
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          logoCompany: row.logoCompany,
          companyName: row.companyName,
          companyWebsite: row.companyWebsite,
          applications: [],
        });
      })
      .on("end", async () => {
        await Job.insertMany(jobs);
        fs.unlinkSync(file.path); // Clean up the temp file
        res
          .status(201)
          .json({ message: "Jobs imported successfully", count: jobs.length });
      });
  } catch (error) {
    res.status(500).json({ message: "CSV import error", error });
  }
};
// 🔹 Get All Jobs with Pagination
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    const { title, location } = req.query;

    if (title) filter.title = { $regex: title, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };

    const [jobs, total] = await Promise.all([
      Job.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      data: jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get a Single Job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    // .populate("companyId", "name")
    // .populate("hrId", "email");

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
    const { title, location, minSalary, maxSalary, jobType, category, status } =
      req.query;

    const filter: any = {};

    if (title) filter.title = { $regex: title, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;
    console.log(jobId);
    console.log(updates);

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

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

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
