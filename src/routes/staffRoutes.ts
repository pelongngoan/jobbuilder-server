import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  importStaff,
  searchStaff,
} from "../controllers/staffController";
import multer from "multer";
import path from "path";
import fs from "fs";
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
const staffRoutes = Router();
staffRoutes.get(
  "/search",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  searchStaff
);
staffRoutes.get(
  "/",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  getAllStaff
);
staffRoutes.post(
  "/",
  authenticate,
  requireRole(["company", "admin"]),
  createStaff
);
staffRoutes.get(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  getStaffById
);
staffRoutes.put(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  updateStaff
);
staffRoutes.delete(
  "/:id",
  authenticate,
  requireRole(["company", "admin"]),
  deleteStaff
);
staffRoutes.post(
  "/import",
  authenticate,
  requireRole(["company", "admin"]),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      importStaff(req, res).catch(next);
    });
  }
);

export default staffRoutes;
