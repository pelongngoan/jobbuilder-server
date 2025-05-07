import express from "express";
import {
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCount,
  cleanupOldNotifications,
} from "../controllers/notificationController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User notification routes
router.get("/", getUserNotifications);
router.get("/count", getNotificationCount);
router.put("/:id/read", markNotificationAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

// Admin-only routes
router.post("/", requireRole(["admin", "hr"]), createNotification);
router.post("/cleanup", requireRole("admin"), cleanupOldNotifications);

export default router;
