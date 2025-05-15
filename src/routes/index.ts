import express from "express";
import jobRoutes from "./jobRoutes";
import userRoutes from "./userRoutes";
import applicationRoutes from "./applicationRoutes";
import companyRoutes from "./companyRoutes";
import { authRoutes } from "./authRoutes";
import hrRoutes from "./hrRoutes";
import jobCategoryRoutes from "./jobCategoryRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";

const router = express.Router();

// router.use("/jobs", jobRoutes);
router.use("/users", userRoutes);
router.use("/applications", applicationRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/job-categories", jobCategoryRoutes);
router.use("/notifications", notificationRoutes);

export default router;
