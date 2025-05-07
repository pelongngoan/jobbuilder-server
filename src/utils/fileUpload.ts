import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories if they don't exist
const uploadDir = path.join(process.cwd(), "uploads");
const resumeDir = path.join(uploadDir, "resumes");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumeDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: userId_timestamp_originalname
    const userId = req.userId || "unknown";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${userId}_${uniqueSuffix}${extension}`);
  },
});

// File filter
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only PDFs, DOCs, DOCXs
  const allowedFileTypes = [".pdf", ".doc", ".docx"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
};

// Export configured multer instance
export const uploadResume = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get relative file path from absolute path
export const getRelativeFilePath = (absolutePath: string) => {
  return absolutePath.replace(process.cwd(), "").replace(/\\/g, "/");
};
