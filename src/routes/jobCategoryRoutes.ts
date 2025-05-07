import express from "express";
import {
  getAllJobCategories,
  getJobCategoryById,
  getJobCategoryBySlug,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
} from "../controllers/jobCategoryController";
import {
  verifyHR,
  verifyUser,
  authenticate,
  requireRole,
} from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getAllJobCategories);
router.get("/id/:id", getJobCategoryById);
router.get("/slug/:slug", getJobCategoryBySlug);

// Protected routes - restricted to HR or admin users
router.post("/", authenticate, requireRole(["hr", "admin"]), createJobCategory);
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
