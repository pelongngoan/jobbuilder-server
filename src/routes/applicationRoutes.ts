import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  applyForJob,
  getUserApplications,
  getApplicationById,
  deleteApplication,
  updateApplicationStatus,
  getJobApplications,
  getCompanyApplications,
  getStaffApplications,
} from "../controllers/applicationController";
const router = express.Router();

router.get("/", authenticate, getUserApplications);
router.get("/company/:companyId", authenticate, getCompanyApplications);
router.post("/:jobId/apply", authenticate, applyForJob);
router.delete("/:applicationId", authenticate, deleteApplication);
router.get("/:applicationId", authenticate, getApplicationById);
// router.put("/:applicationId/status", authenticate, updateApplicationStatus);
router.get("/job/:jobId", authenticate, getJobApplications);
router.get("/staff/:staffId", authenticate, getStaffApplications);
router.put("/:applicationId", authenticate, updateApplicationStatus);

export default router;
