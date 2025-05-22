import express from "express";
import {
  createResume,
  getResume,
  updateResume,
  deleteResume,
  getResumeByUserId,
  getResumeById,
  uploadResume,
} from "../controllers/resumeController";
import { authenticate } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const resumeUploadDir = path.join(process.cwd(), "uploads/resumes");
if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, { recursive: true });
}

// Configure multer to only allow PDF files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/resumes"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Only accept PDF files
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post("/", authenticate, createResume);
router.get("/", authenticate, getResume);
router.delete("/:resumeId", authenticate, deleteResume);
router.put("/:resumeId", authenticate, updateResume);
router.get("/:resumeId", authenticate, getResumeById);
router.post("/upload", authenticate, upload.single("file"), uploadResume);

export default router;
