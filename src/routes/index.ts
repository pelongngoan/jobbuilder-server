import { Router } from "express";
import { authRoutes } from "./Auth";
export const router = Router();
router.use("/auth", authRoutes);
