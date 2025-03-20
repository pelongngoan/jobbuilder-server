import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Application } from "../database/models/Application";
import { HR } from "../database/models/HR";
import { Job } from "../database/models/Job";

dotenv.config();

// Generate JWT Token
const generateToken = (hrId: string) => {
  return jwt.sign({ hrId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// 🔹 HR Login
export const hrLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hr = await HR.findOne({ email });

    if (!hr) {
      res.status(400).json({ message: "HR not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(hr._id.toString());

    res.status(200).json({ message: "Login successful", token, hr });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get HR Details
export const getHRDetails = async (req: Request, res: Response) => {
  try {
    const hrId = req.hrId;
    const hr = await HR.findById(hrId).populate("companyId");

    if (!hr) {
      res.status(404).json({ message: "HR not found" });
      return;
    }

    res.status(200).json(hr);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update HR Account
export const updateHR = async (req: Request, res: Response) => {
  try {
    const hrId = req.hrId;
    const updates = req.body;

    const updatedHR = await HR.findByIdAndUpdate(hrId, updates, { new: true });

    if (!updatedHR) {
      res.status(404).json({ message: "HR not found" });
      return;
    }

    res.status(200).json({ message: "HR updated successfully", updatedHR });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete HR Account
export const deleteHR = async (req: Request, res: Response) => {
  try {
    const hrId = req.hrId;

    await HR.findByIdAndDelete(hrId);
    res.status(200).json({ message: "HR account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 HR Creates a Job Post
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, location, salary, requirements, other } =
      req.body;
    const hrId = req.hrId;

    const newJob = new Job({
      title,
      description,
      location,
      salary,
      requirements,
      other,
      hrId,
      companyId: req.companyId, // Assuming middleware sets req.companyId
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", newJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 HR Gets All Job Posts
export const getHRJobs = async (req: Request, res: Response) => {
  try {
    const hrId = req.hrId;
    const jobs = await Job.find({ hrId });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 HR Manages Job Applications
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

// 🔹 HR Updates Job Post
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

// 🔹 HR Deletes Job Post
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
