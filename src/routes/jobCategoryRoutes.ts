import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getAllJobCategories,
  getJobCategoryById,
  getJobCategoryBySlug,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  searchJobCategories,
  importCategoriesFromCSV,
  getAllJobCategoriesParent,
} from "../controllers/jobCategoryController";
import {
  verifyHR,
  verifyUser,
  authenticate,
  requireRole,
} from "../middleware/authMiddleware";

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

const router = express.Router();

// Public routes
router.get("/", getAllJobCategoriesParent);
router.get("/all", getAllJobCategories);
router.get("/search", searchJobCategories);
router.get("/id/:id", getJobCategoryById);
router.get("/slug/:slug", getJobCategoryBySlug);

// Protected routes - restricted to HR or admin users
router.post("/", authenticate, requireRole(["hr", "admin"]), createJobCategory);
router.post(
  "/upload",
  authenticate,
  requireRole(["hr", "admin"]),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      importCategoriesFromCSV(req, res).catch(next);
    });
  }
);
router.put(
  "/:id",
  authenticate,
  requireRole(["hr", "admin"]),
  updateJobCategory
);
router.delete(
  "/:id",
  authenticate,
  requireRole(["hr", "admin"]),
  deleteJobCategory
);

export default router;
