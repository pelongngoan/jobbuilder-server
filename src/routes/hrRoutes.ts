import express from "express";
import {
  hrLogin,
  getHRDetails,
  updateHR,
  deleteHR,
  createJob,
  getHRJobs,
  getJobApplications,
  updateJob,
  deleteJob,
} from "../controllers/hrController";
import { verifyHR } from "../middleware/authMiddleware";

const hrRoutes = express.Router();

// 🔹 HR Authentication
hrRoutes.post("/login", hrLogin);

// 🔹 HR Account Management
hrRoutes.get("/profile", verifyHR, getHRDetails);
hrRoutes.put("/profile", verifyHR, updateHR);
hrRoutes.delete("/profile", verifyHR, deleteHR);

// 🔹 Job Management by HR
hrRoutes.post("/job", verifyHR, createJob);
hrRoutes.get("/jobs", verifyHR, getHRJobs);
hrRoutes.get("/job/:jobId/applications", verifyHR, getJobApplications);
hrRoutes.put("/job/:jobId", verifyHR, updateJob);
hrRoutes.delete("/job/:jobId", verifyHR, deleteJob);

export default hrRoutes;
