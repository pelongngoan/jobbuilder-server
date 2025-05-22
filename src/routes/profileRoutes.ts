import { Router } from "express";
import { getProfile } from "../controllers/profileController";
import { updateProfile } from "../controllers/profileController";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    // Get file extension
    const ext = path.extname(file.originalname);
    // Create filename
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
const profileRoutes = Router();

profileRoutes.get("/:id", authenticate, getProfile);
profileRoutes.put(
  "/:id",
  authenticate,
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  (req, res, next) => {
    updateProfile(req, res).catch(next);
  }
);

export default profileRoutes;
