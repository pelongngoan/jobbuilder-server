import { Request, Response } from "express";
import { IJob, Job } from "../database/models/Job";
import { Application } from "../database/models/Application";
import { JobCategory } from "../database/models/JobCategory";
import fs from "fs";
import csv from "csv-parser";
import { StaffProfile } from "../database/models/StaffProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { Profile } from "../database/models/Profile";
// 🔹 Create a Job Post (HR Only)
export const createJob = async (req: Request, res: Response) => {
  try {
    let companyId = req.companyProfileId;
    const staffProfileId = req.staffProfileId;
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
      contacterId,
      contacterEmail,
      keyResponsibilities,
      experienceLevel,
      other,
      isFeatured,
    } = req.body;
    if (
      !title &&
      !location &&
      !jobType &&
      !description &&
      !salaryFrom &&
      !salaryTo &&
      !salaryCurrency &&
      !benefits &&
      !category &&
      !skills &&
      !status &&
      !deadline &&
      !requirements &&
      !contacterEmail &&
      !keyResponsibilities &&
      !experienceLevel &&
      !other &&
      !isFeatured
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    console.log(req.body);
    if (!companyId) {
      const company = await StaffProfile.findById(staffProfileId);
      if (!company) {
        res.status(400).json({ message: "Company not found" });
        return;
      }
      companyId = company.companyId.toString();
    }
    const slug =
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "") +
      "-" +
      Date.now().toString().slice(-4);
    const profile = await Profile.findOne({ email: contacterEmail });
    const contacter = await StaffProfile.findOne({
      profile: profile?._id,
    });
    if (!contacter) {
      res.status(400).json({ message: "Contacter not found" });
      return;
    }

    if (contacter.role !== "hr") {
      res.status(400).json({ message: "Contacter is not an HR" });
      return;
    }
    // Create new job
    const newJob = new Job({
      companyId,
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
      contacterId,
      keyResponsibilities,
      experienceLevel,
      other,
      isFeatured,
      slug,
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", newJob });
  } catch (error) {
    console.error("Job creation error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const uploadJobsFromCSV = async (req: Request, res: Response) => {
  const file = req.file;
  const companyId = req.companyProfileId;
  console.log("Request body:", req.body);

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  if (!companyId) {
    fs.unlinkSync(file.path);
    res.status(400).json({ message: "Company ID is required" });
    return;
  }

  const companyProfile = await CompanyProfile.findById(companyId);
  if (!companyProfile) {
    fs.unlinkSync(file.path);
    res.status(404).json({ message: "Company not found" });
    return;
  }

  const jobs: Partial<IJob>[] = [];
  const successfulJobs: any[] = [];
  const failedJobs: any[] = [];

  try {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        try {
          // Convert CSV row to job object
          const job = {
            title: row.Title,
            description: row.Description,
            location: row.Location,
            jobType: row["Job Type"],
            experienceLevel: row["Experience Level"],
            salaryFrom: parseFloat(row["Salary From"]),
            salaryTo: parseFloat(row["Salary To"]),
            salaryCurrency: row["Salary Currency"],
            skills: row.Skills.split(";"),
            status: row.Status,
            benefits: row.Benefits.split(";"),
            contacterEmail: row["Contact Email"],
            isFeatured: row["Is Featured"].toLowerCase() === "true",
            requirements: row.Requirements.split(";"),
            keyResponsibilities: row["Key Responsibilities"].split(";"),
            category: row.Category,
            deadline: new Date(row.Deadline),
            companyId: companyId,
            slug: `${row.Title.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w\-]+/g, "")}-${Date.now().toString().slice(-4)}`,
          };
          jobs.push(job);
        } catch (err) {
          console.error("Error processing row:", err);
          failedJobs.push({
            row,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      })
      .on("end", async () => {
        // Process all jobs
        for (const job of jobs) {
          try {
            // Validate and get contacter information
            const profile = await Profile.findOne({
              email: job.contacterEmail,
            });
            const contacter = await StaffProfile.findOne({
              profile: profile?._id,
            });

            if (!contacter) {
              throw new Error(
                `Contacter not found for email: ${job.contacterEmail}`
              );
            }

            if (contacter.role !== "hr") {
              throw new Error(`Contacter ${job.contacterEmail} is not an HR`);
            }

            // Create the job with contacter information
            const newJob = await Job.create({
              ...job,
              contacterId: contacter._id,
            });

            successfulJobs.push(newJob);
          } catch (err) {
            failedJobs.push({
              job,
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        res.status(201).json({
          success: true,
          message: "Jobs imported",
          data: {
            successCount: successfulJobs.length,
            failedCount: failedJobs.length,
            jobs: successfulJobs,
            errors: failedJobs,
          },
        });
      });
  } catch (error) {
    console.error("CSV import error:", error);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json({
      success: false,
      message: "CSV import error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
// 🔹 Get All Jobs with Pagination and Advanced Filtering
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { status: "open" };
    const sort: any = { isFeatured: -1, createdAt: -1 };

    // Extract query parameters
    const {
      title,
      location,
      experienceLevel,
      salaryType,
      jobType,
      skills,
      category,
      featured,
      remote,
      minSalary,
      maxSalary,
      q,
    } = req.query;

    // Full text search
    if (q) {
      filter.$text = { $search: q as string };
      sort.score = { $meta: "textScore" };
    }

    // Basic filters
    if (title) filter.title = { $regex: title, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (salaryType) filter.salaryType = salaryType;
    if (jobType) filter.jobType = jobType;
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (remote === "true") filter.jobType = "remote";

    // Skills filter - can be comma-separated string or array
    if (skills) {
      const skillsList = Array.isArray(skills)
        ? skills
        : (skills as string).split(",");

      filter.skills = { $in: skillsList };
    }

    // Salary range
    if (minSalary || maxSalary) {
      filter.salaryRange = {};
      if (minSalary) {
        // This is a simplified approach - in reality, you'd need a more sophisticated
        // algorithm to parse salary ranges, convert currencies, etc.
        filter.salaryRange = {
          $regex: new RegExp(
            `${minSalary}|[${parseInt(minSalary as string)}-9][0-9]+`
          ),
        };
      }
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("category", "name slug")
        .populate("skills", "name category")
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      data: jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get a job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate("category", "name slug")
      .populate("skills", "name category slug");

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    // Increment view count
    // Don't wait for this to complete
    Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } }).exec();

    res.status(200).json(job);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get a job by slug
export const getJobBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const job = await Job.findOne({ slug })
      .populate("category", "name slug")
      .populate("skills", "name category slug");

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    // Increment view count - don't wait for this to complete
    Job.findByIdAndUpdate(job._id, { $inc: { viewCount: 1 } }).exec();

    res.status(200).json(job);
  } catch (error) {
    console.error("Get job by slug error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Search Jobs with Advanced Filters
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const {
      title,
      query,
      location,
      minSalary,
      maxSalary,
      jobType,
      category,
      status,
      experienceLevel,
      salaryType,
      skills,
      remote,
      featured,
      sort = "relevance",
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = { status: status || "open" };
    const sortOptions: any = {};

    // If there's a text search query, use text index
    const searchTerm = title || query;
    if (searchTerm) {
      filter.$text = { $search: searchTerm as string };
      if (sort === "relevance") {
        sortOptions.score = { $meta: "textScore" };
      }
    }

    // Basic filters
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (salaryType) filter.salaryType = salaryType;
    if (featured === "true") filter.isFeatured = true;
    if (remote === "true") filter.jobType = "remote";

    // Skills filter
    if (skills) {
      const skillsList = Array.isArray(skills)
        ? skills
        : (skills as string).split(",");

      filter.skills = { $in: skillsList };
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      case "mostViewed":
        sortOptions.viewCount = -1;
        break;
      case "mostApplied":
        sortOptions.applicationCount = -1;
        break;
      default:
        // Default sort: featured first, then by date
        sortOptions.isFeatured = -1;
        sortOptions.createdAt = -1;
    }

    // Add pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("category", "name slug")
        .populate("skills", "name category")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      data: jobs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Search jobs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Update a job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Delete a job posting
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // First check for existing applications
    const applicationCount = await Application.countDocuments({ jobId });
    if (applicationCount > 0) {
      // Instead of deleting, set status to closed
      await Job.findByIdAndUpdate(jobId, { status: "closed" });
      res.status(200).json({
        message:
          "Job has existing applications. Status changed to closed instead of deleting.",
      });
      return;
    }

    // If no applications, delete the job
    const result = await Job.findByIdAndDelete(jobId);

    if (!result) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Apply for a job
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { userId, resumeId, coverLetter } = req.body;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res
        .status(400)
        .json({ message: "This job is not accepting applications" });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Create application
    const application = new Application({
      userId,
      jobId,
      resumeId,
      coverLetter,
      status: "pending",
    });

    await application.save();

    // Update job's applications array and increment application count
    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: application._id },
      $inc: { applicationCount: 1 },
    });

    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Apply for job error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get all applications for a job
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate("userId", "name email")
      .populate("resumeId")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get all jobs posted by an HR
export const getHRJobs = async (req: Request, res: Response) => {
  try {
    const { hrId } = req.params;
    const jobs = await Job.find({ hrId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Get HR jobs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get all applications for jobs posted by an HR
export const getJobApplicationsHR = async (req: Request, res: Response) => {
  try {
    const { hrId } = req.params;

    // First get all jobs by this HR
    const jobs = await Job.find({ hrId }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("userId", "name email")
      .populate("jobId", "title companyName")
      .populate("resumeId")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Get HR job applications error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Get similar jobs based on category and skills
export const getSimilarJobs = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    const query: any = {
      _id: { $ne: jobId },
      status: "open",
    };

    // Match by category or skills if available
    if (job.category) {
      query.category = job.category;
    }

    if (job.skills && job.skills.length > 0) {
      query.skills = { $in: job.skills };
    }

    const similarJobs = await Job.find(query)
      .populate("category", "name")
      .populate("skills", "name")
      .limit(limit)
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json(similarJobs);
  } catch (error) {
    console.error("Get similar jobs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
