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
import {
  requireRole,
  verifyHR,
  verifyUser,
  authenticate,
} from "../middleware/authMiddleware";
import multer from "multer";
import { getCompanyJobs, getHrJobs } from "../controllers/companyController";

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

// // Public routes
// jobRoutes.get("/", getAllJobs);
// jobRoutes.get("/search", searchJobs);
// jobRoutes.get("/slug/:slug", getJobBySlug);
// jobRoutes.get("/:jobId", getJobById);
// jobRoutes.get("/:jobId/similar", getSimilarJobs);

// // Protected routes
// jobRoutes.post("/", verifyHR, createJob);

// jobRoutes.put("/:jobId", verifyHR, updateJob);
// jobRoutes.delete("/:jobId", verifyHR, deleteJob);
// jobRoutes.get("/:jobId/applications", verifyHR, getJobApplications);

jobRoutes.post("/", authenticate, requireRole(["staff", "company"]), createJob);
jobRoutes.get(
  "/company",
  authenticate,
  requireRole(["staff", "company"]),
  getCompanyJobs
);
jobRoutes.get("/hr/:hrId", authenticate, requireRole(["staff"]), getHrJobs);
jobRoutes.post(
  "/upload",
  authenticate,
  requireRole(["staff", "company"]),
  upload.single("file"),
  (req, res, next) => {
    // Add companyId from form data to request body
    if (req.body.companyId) {
      req.companyProfileId = req.body.companyId;
    }
    uploadJobsFromCSV(req, res).catch(next);
  }
);

export default jobRoutes;
