import express from "express";
import jobRoutes from "./jobRoutes";
import userRoutes from "./userRoutes";
import applicationRoutes from "./applicationRoutes";
import companyRoutes from "./companyRoutes";
import { authRoutes } from "./authRoutes";
import jobCategoryRoutes from "./jobCategoryRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";
import staffRoutes from "./staffRoutes";
import profileRoutes from "./profileRoutes";
const router = express.Router();

// router.use("/jobs", jobRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/job-categories", jobCategoryRoutes);
router.use("/staffs", staffRoutes);
router.use("/jobs", jobRoutes);
router.use("/profile", profileRoutes);

export default router;
