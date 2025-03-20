import { Router } from "express";
import { authRoutes } from "./authRoutes";
import userRoutes from "./userRoutes";
export const router = Router();
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
