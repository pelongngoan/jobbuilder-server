import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  importCategoriesFromCSV,
  searchJobCategories,
} from "../controllers/jobCategoryController";
import { authenticate } from "../middleware/authMiddleware";

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
router.get("/search", authenticate, searchJobCategories);
router.get("/", authenticate, getCategories);
router.get("/:id", authenticate, getCategoryById);
router.post("/", authenticate, createCategory);
router.put("/:id", authenticate, updateCategory);
router.delete("/:id", authenticate, deleteCategory);
router.post("/upload", authenticate, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    importCategoriesFromCSV(req, res).catch(next);
  });
});

export default router;
