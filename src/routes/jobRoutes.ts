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
  uploadJobsFromCSV,
} from "../controllers/jobController";
import { verifyHR, verifyUser } from "../middleware/authMiddleware";
import multer from "multer";

const jobRoutes = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary upload folder

jobRoutes.post("/upload/csv", upload.single("file"), uploadJobsFromCSV);
// 🔹 Public Routes
jobRoutes.get("/", getAllJobs);
jobRoutes.get("/search", searchJobs);
jobRoutes.get("/:jobId", getJobById);

// 🔹 HR Routes (Protected)
jobRoutes.post("/", createJob);
jobRoutes.put("/:jobId", verifyHR, updateJob);
jobRoutes.delete("/:jobId", verifyHR, deleteJob);
jobRoutes.get("/:jobId/applications", verifyHR, getJobApplications);

// 🔹 User Routes (Protected)
jobRoutes.post("/:jobId/apply", verifyUser, applyForJob);

export default jobRoutes;
