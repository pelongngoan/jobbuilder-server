import { Router } from "express";
import { authRoutes } from "./authRoutes";
import userRoutes from "./userRoutes";
import chatRoutes from "./chatRoutes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
