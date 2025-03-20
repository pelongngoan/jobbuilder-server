import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  searchJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
} from "../controllers/jobController";
import { verifyHR, verifyUser } from "../middleware/authMiddleware";

const jobRoutes = express.Router();

// 🔹 Public Routes
jobRoutes.get("/", getAllJobs);
jobRoutes.get("/search", searchJobs);
jobRoutes.get("/:jobId", getJobById);

// 🔹 HR Routes (Protected)
jobRoutes.post("/", verifyHR, createJob);
jobRoutes.put("/:jobId", verifyHR, updateJob);
jobRoutes.delete("/:jobId", verifyHR, deleteJob);
jobRoutes.get("/:jobId/applications", verifyHR, getJobApplications);

// 🔹 User Routes (Protected)
jobRoutes.post("/:jobId/apply", verifyUser, applyForJob);

export default jobRoutes;
