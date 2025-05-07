import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobBySlug,
  searchJobs,
  updateJob,
  deleteJob,
  getJobApplications,
  getSimilarJobs,
  uploadJobsFromCSV,
} from "../controllers/jobController";
import { verifyHR, verifyUser } from "../middleware/authMiddleware";
import multer from "multer";

// Storage config for CSV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const jobRoutes = express.Router();

// Public routes
jobRoutes.get("/", getAllJobs);
jobRoutes.get("/search", searchJobs);
jobRoutes.get("/slug/:slug", getJobBySlug);
jobRoutes.get("/:jobId", getJobById);
jobRoutes.get("/:jobId/similar", getSimilarJobs);

// Protected routes
jobRoutes.post("/", verifyHR, createJob);
jobRoutes.post(
  "/upload",
  verifyHR,
  upload.single("csvFile"),
  uploadJobsFromCSV
);
jobRoutes.put("/:jobId", verifyHR, updateJob);
jobRoutes.delete("/:jobId", verifyHR, deleteJob);
jobRoutes.get("/:jobId/applications", verifyHR, getJobApplications);

export default jobRoutes;
