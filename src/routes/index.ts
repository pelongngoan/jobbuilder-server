import { Router } from "express";
import { authRoutes } from "./authRoutes";
import userRoutes from "./userRoutes";
import chatRoutes from "./chatRoutes";
import accountRoutes from "./accountRoutes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/management", accountRoutes);
router.use("/chat", chatRoutes);
