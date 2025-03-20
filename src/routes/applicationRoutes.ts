import express from "express";
import {
  applyForJob,
  getUserApplications,
  getApplicationById,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController";
import { verifyHR, verifyUser } from "../middleware/authMiddleware";

const router = express.Router();

// 🔹 User Routes (Protected)
router.post("/:jobId/apply", verifyUser, applyForJob);
router.get("/", verifyUser, getUserApplications);
router.get("/:applicationId", verifyUser, getApplicationById);
router.delete("/:applicationId", verifyUser, deleteApplication);

// 🔹 HR Routes (Protected)
router.get("/job/:jobId", verifyHR, getJobApplications);
router.put("/:applicationId/status", verifyHR, updateApplicationStatus);

export default router;
