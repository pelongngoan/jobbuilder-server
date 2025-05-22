import express from "express";
import {
  createJob,
  getFeaturedJobs,
  uploadJobsFromCSV,
  getCompanyJobs,
  getHrJobs,
  getJobByCategoryId,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
  saveJob,
} from "../controllers/jobController";
import { requireRole, authenticate } from "../middleware/authMiddleware";
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

jobRoutes.post("/", authenticate, requireRole(["staff", "company"]), createJob);
jobRoutes.get(
  "/company",
  authenticate,
  // requireRole(["staff", "company"]),
  getCompanyJobs
);
jobRoutes.put(
  "/:jobId",
  authenticate,
  requireRole(["staff", "company"]),
  updateJob
);
jobRoutes.get("/hr", authenticate, requireRole(["staff"]), getHrJobs);
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

jobRoutes.get("/featured", getFeaturedJobs);
jobRoutes.get("/categories/:categoryId", getJobByCategoryId);
jobRoutes.get(
  "/:jobId",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "wallPaper", maxCount: 1 },
  ]),
  getJobById
);
jobRoutes.delete(
  "/:jobId",
  authenticate,
  requireRole(["staff", "company"]),
  deleteJob
);
jobRoutes.get("/search", searchJobs);

export default jobRoutes;
