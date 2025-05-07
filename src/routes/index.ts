import express from "express";
import jobRoutes from "./jobRoutes";
import userRoutes from "./userRoutes";
import applicationRoutes from "./applicationRoutes";
import companyRoutes from "./companyRoutes";
import { authRoutes } from "./authRoutes";
import hrRoutes from "./hrRoutes";
import skillRoutes from "./skillRoutes";
import jobCategoryRoutes from "./jobCategoryRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";
import savedJobsRoutes from "./savedJobsRoutes";

const router = express.Router();

router.use("/jobs", jobRoutes);
router.use("/users", userRoutes);
router.use("/applications", applicationRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/hr", hrRoutes);
router.use("/admin", adminRoutes);
router.use("/skills", skillRoutes);
router.use("/job-categories", jobCategoryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/saved-jobs", savedJobsRoutes);

export default router;
