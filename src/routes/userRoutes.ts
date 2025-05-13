import express from "express";
import {
  getUserProfile,
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  uploadResumeFile,
  createProfile,
  updateProfile,
  unsaveJob,
  saveJob,
  applyToJob,
  removeApplication,
  addEducation,
  removeEducation,
} from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { uploadResume } from "../utils/fileUpload";

const userRoutes = express.Router();

// 🔹 User Profile Routes
userRoutes.post("/profile", authenticate, requireRole("user"), createProfile);
userRoutes.put("/profile", authenticate, requireRole("user"), updateProfile);
userRoutes.get("/profile", authenticate, requireRole("user"), getUserProfile);
// 🔹 Job Routes
userRoutes.post(
  "/jobs/:jobId/save",
  authenticate,
  requireRole("user"),
  saveJob
);
userRoutes.put(
  "/jobs/:jobId/unsave",
  authenticate,
  requireRole("user"),
  unsaveJob
);
userRoutes.post(
  "/jobs/:jobId/apply",
  authenticate,
  requireRole("user"),
  applyToJob
);
userRoutes.put(
  "/jobs/:jobId/remove",
  authenticate,
  requireRole("user"),
  removeApplication
);

// 🔹 Education Routes
userRoutes.post(
  "/education/:educationId",
  authenticate,
  requireRole("user"),
  addEducation
);
userRoutes.put(
  "/education/:educationId",
  authenticate,
  requireRole("user"),
  removeEducation
);

// 🔹 Resume Routes
userRoutes.post("/resumes", authenticate, requireRole("user"), createResume);
userRoutes.post(
  "/resumes/upload",
  authenticate,
  requireRole("user"),
  uploadResume.single("file"),
  uploadResumeFile
);
userRoutes.get("/resumes", authenticate, requireRole("user"), getUserResumes);
userRoutes.get(
  "/resumes/:resumeId",
  authenticate,
  requireRole("user"),
  getResumeById
);
userRoutes.put(
  "/resumes/:resumeId",
  authenticate,
  requireRole("user"),
  updateResume
);
userRoutes.delete(
  "/resumes/:resumeId",
  authenticate,
  requireRole("user"),
  deleteResume
);

export default userRoutes;
