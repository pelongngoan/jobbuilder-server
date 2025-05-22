import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  applyForJob,
  getUserApplications,
  getApplicationById,
  deleteApplication,
  updateApplicationStatus,
  getJobApplications,
} from "../controllers/applicationController";
const router = express.Router();

router.get("/", authenticate, getUserApplications);
router.post("/:jobId/apply", authenticate, applyForJob);
router.delete("/:applicationId", authenticate, deleteApplication);
router.get("/:applicationId", authenticate, getApplicationById);
router.put("/:applicationId", authenticate, updateApplicationStatus);
router.get("/job/:jobId", authenticate, getJobApplications);

export default router;
