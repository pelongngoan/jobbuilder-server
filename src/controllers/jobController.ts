import { Request, Response } from "express";
import { IJob, Job } from "../database/models/Job";
import { JobCategory } from "../database/models/JobCategory";
import fs from "fs";
import csv from "csv-parser";
import { StaffProfile } from "../database/models/StaffProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { Profile } from "../database/models/Profile";
import { ObjectId } from "mongoose";
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
    let contacter;
    if (contacterId) {
      contacter = await StaffProfile.findById(contacterId);
    } else {
      contacter = await StaffProfile.findOne({
        profile: profile?._id,
      });
    }
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
export const updateJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const {
      title,
      description,
      location,
      jobType,
      experienceLevel,
      salaryFrom,
      salaryTo,
      salaryCurrency,
      skills,
      status,
      benefits,
      contacterId,
      isFeatured,
      requirements,
      keyResponsibilities,
      category,
      deadline,
      other,
    } = req.body;
    const staff = await StaffProfile.findById(contacterId).populate("profile");
    if (!staff) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        title,
        description,
        location,
        jobType,
        experienceLevel,
        salaryFrom,
        salaryTo,
        salaryCurrency,
        contacterEmail: staff.profile?.email,
        skills,
        status,
        benefits,
        contacterId,
        isFeatured,
        requirements,
        keyResponsibilities,
        category,
        deadline,
        other,
      },
      { new: true }
    );
    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Job update error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const uploadJobsFromCSV = async (req: Request, res: Response) => {
  const file = req.file;
  const companyId = req.companyProfileId;
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
      .on("data", async (row) => {
        try {
          const job = {
            title: row.Title as string,
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
          jobs.push(job as unknown as Partial<IJob>);
        } catch (err) {
          console.error("Error processing row:", err);
          failedJobs.push({
            row,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      })
      .on("end", async () => {
        for (const job of jobs) {
          try {
            // Find category by name
            const categoryDoc = await JobCategory.findOne({
              name: job.category,
            });
            if (!categoryDoc) {
              throw new Error(`Category not found: ${job.category}`);
            }

            // Update category field to category ID
            job.category = categoryDoc._id as ObjectId;

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

            // Create the job with contacter and category info
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
export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const companyId = req.query.companyId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!companyId) {
      res.status(400).json({ message: "Company ID is required" });
      return;
    }

    const companyProfile = await CompanyProfile.findById(companyId);
    if (!companyProfile) {
      res.status(404).json({ message: "Company profile not found" });
      return;
    }

    const jobs = await Job.find({ companyId: companyProfile._id })
      .populate("category")
      .populate({
        path: "contacterId",
        populate: {
          path: "profile",
          select: "email firstName lastName",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ companyId: companyProfile._id });

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get company jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getHrJobs = async (req: Request, res: Response) => {
  try {
    const hrId = req.query.hrId as string; // read from query, not params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!hrId) {
      res.status(400).json({ message: "hrId is required" });
      return;
    }

    const jobs = await Job.find({ contacterId: hrId })
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ contacterId: hrId });

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get hr jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getFeaturedJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ isFeatured: true })
      .populate("category")
      .populate("companyId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get featured jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getJobByCategoryId = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;
    const jobs = await Job.find({ category: categoryId })
      .populate("category")
      .populate("companyId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get job by category error:", error);
  }
};
export const getJobById = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId)
      .populate("category")
      .populate("companyId")
      .populate("contacterId");
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job by id error:", error);
  }
};
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { query, page, limit } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const jobs = await Job.find({
      title: { $regex: query as string, $options: "i" },
    })
      .populate("category")
      .populate("companyId")
      .populate("contacterId")
      .skip(skip)
      .limit(limitNum);
    const total = await Job.countDocuments({
      title: { $regex: query as string, $options: "i" },
    });
    res.status(200).json({
      success: true,
      data: jobs,
      total,
    });
  } catch (error) {
    console.error("Search jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
