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
jobRoutes.post("/", createJob);

jobRoutes.get("/", getAllJobs);
jobRoutes.get("/:jobId", getJobById);
jobRoutes.put("/:jobId", updateJob);
jobRoutes.delete("/:jobId", deleteJob);

jobRoutes.get("/search", searchJobs);

jobRoutes.get("/:jobId/applications", getJobApplications);
jobRoutes.post("/:jobId/apply", verifyUser, applyForJob);

export default jobRoutes;
