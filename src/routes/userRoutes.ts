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
  getUsers,
  importUsers,
} from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { uploadResume } from "../utils/fileUpload";
import multer from "multer";
import path from "path";
import fs from "fs";
const userRoutes = express.Router();
// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage config for CSV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (!file) {
      return cb(null, false);
    }

    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
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
userRoutes.get("/", authenticate, requireRole("admin"), getUsers);
userRoutes.post(
  "/import",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      importUsers(req, res).catch(next);
    });
  }
);

export default userRoutes;
