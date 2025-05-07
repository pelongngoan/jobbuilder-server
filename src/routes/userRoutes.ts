import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  changePassword,
  deleteUserAccount,
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  uploadResumeFile,
} from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { uploadResume } from "../utils/fileUpload";

const userRoutes = express.Router();

// 🔹 Profile Routes
userRoutes.get("/profile", authenticate, requireRole("user"), getUserProfile);
userRoutes.put(
  "/profile",
  authenticate,
  requireRole("user"),
  updateUserProfile
);

// 🔹 Education Routes
userRoutes.post("/education", authenticate, requireRole("user"), addEducation);
userRoutes.put(
  "/education/:educationId",
  authenticate,
  requireRole("user"),
  updateEducation
);
userRoutes.delete(
  "/education/:educationId",
  authenticate,
  requireRole("user"),
  deleteEducation
);

// 🔹 Experience Routes
userRoutes.post(
  "/experience",
  authenticate,
  requireRole("user"),
  addExperience
);
userRoutes.put(
  "/experience/:experienceId",
  authenticate,
  requireRole("user"),
  updateExperience
);
userRoutes.delete(
  "/experience/:experienceId",
  authenticate,
  requireRole("user"),
  deleteExperience
);

// 🔹 Resume Routes
userRoutes.post("/resumes", authenticate, requireRole("user"), createResume);

// File upload route for resumes
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

// 🔹 Account Routes
userRoutes.post("/change-password", authenticate, changePassword);
userRoutes.delete("/delete-account", authenticate, deleteUserAccount);

export default userRoutes;
