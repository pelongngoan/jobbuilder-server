import { Request, Response } from "express";
import { HR } from "../database/models/HR";
import { Job } from "../database/models/Job";
import { Company } from "../database/models/Company";

// 🔹 Create a New Company
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, industry, location, description, website } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      res.status(400).json({ message: "Company already exists" });
      return;
    }

    // Create new company
    const newCompany = new Company({
      name,
      industry,
      location,
      description,
      website,
      createdBy: req.userId, // Assuming req.userId is the authenticated user
    });

    await newCompany.save();
    res
      .status(201)
      .json({ message: "Company created successfully", newCompany });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Company Details
export const getCompanyDetails = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId).populate(
      "createdBy",
      "name email"
    );

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Company Information
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const updates = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, {
      new: true,
    });

    if (!updatedCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Company updated successfully", updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete Company
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    await HR.deleteMany({ companyId });
    await Job.deleteMany({ companyId });
    await Company.findByIdAndDelete(companyId);

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Add HR to Company
export const addHR = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { name, email, password } = req.body;

    // Create HR account
    const newHR = new HR({ name, email, password, companyId });

    await newHR.save();
    res.status(201).json({ message: "HR added successfully", newHR });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get HR List for a Company
export const getCompanyHRs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const hrList = await HR.find({ companyId });

    res.status(200).json(hrList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Remove HR from Company
export const removeHR = async (req: Request, res: Response) => {
  try {
    const { hrId } = req.params;

    await HR.findByIdAndDelete(hrId);
    res.status(200).json({ message: "HR removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Job Posts for a Company
export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const jobs = await Job.find({ companyId });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
