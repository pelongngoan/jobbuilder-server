import express from "express";
import {
  saveJob,
  getSavedJobs,
  checkIfJobSaved,
  removeSavedJob,
} from "../controllers/savedJobsController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// All saved jobs routes require authentication
router.use(authenticate);

// Save a job
router.post("/:jobId", saveJob);

// Get all saved jobs for the authenticated user
router.get("/", getSavedJobs);

// Check if a job is saved
router.get("/:jobId/check", checkIfJobSaved);

// Remove a saved job
router.delete("/:jobId", removeSavedJob);

export default router;
