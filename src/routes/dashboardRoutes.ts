import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

// Dashboard statistics endpoint
router.get("/stats", authenticate, getDashboardStats);

export default router;
