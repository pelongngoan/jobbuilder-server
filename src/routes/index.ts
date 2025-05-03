import { Router } from "express";
import { authRoutes } from "./authRoutes";
import userRoutes from "./userRoutes";
import chatRoutes from "./chatRoutes";
import accountRoutes from "./accountRoutes";
import jobRoutes from "./jobRoutes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/management", accountRoutes);
router.use("/chat", chatRoutes);
router.use("/job", jobRoutes);
