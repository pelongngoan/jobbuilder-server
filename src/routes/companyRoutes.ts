import express from "express";
import {
  createCompany,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
  addHR,
  getCompanyHRs,
  removeHR,
  getCompanyJobs,
} from "../controllers/companyController";
import {
  authenticateUser,
  verifyCompany,
  verifyUser,
} from "../middleware/authMiddleware";

const companyRoutes = express.Router();

// 🔹 Company Management
companyRoutes.post("/signup", verifyUser, createCompany); // Create a new company
companyRoutes.get("/:companyId", authenticateUser, getCompanyDetails); // Get company details
companyRoutes.put("/:companyId", verifyCompany, updateCompany); // Update company details
companyRoutes.delete("/:companyId", verifyCompany, deleteCompany); // Delete company

// 🔹 HR Management
companyRoutes.post("/:companyId/hr", verifyCompany, addHR); // Add HR to company
companyRoutes.get("/:companyId/hr", verifyCompany, getCompanyHRs); // Get all HRs in a company
companyRoutes.delete("/hr/:hrId", verifyCompany, removeHR); // Remove HR from company

// 🔹 Job Management
companyRoutes.get("/:companyId/jobs", verifyUser, getCompanyJobs); // Get all jobs for a company

export default companyRoutes;
