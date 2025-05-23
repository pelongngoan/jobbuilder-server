import express from "express";
import jobRoutes from "./jobRoutes";
import userRoutes from "./userRoutes";
import companyRoutes from "./companyRoutes";
import { authRoutes } from "./authRoutes";
import jobCategoryRoutes from "./jobCategoryRoutes";
import staffRoutes from "./staffRoutes";
import profileRoutes from "./profileRoutes";
import resumeRoutes from "./resumeRoutes";
import applicationRoutes from "./applicationRoutes";
import saveJobRoutes from "./saveJobRoutes";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/categories", jobCategoryRoutes);
router.use("/staffs", staffRoutes);
router.use("/jobs", jobRoutes);
router.use("/profile", profileRoutes);
router.use("/resumes", resumeRoutes);
router.use("/applications", applicationRoutes);
router.use("/saveJobs", saveJobRoutes);

export default router;
