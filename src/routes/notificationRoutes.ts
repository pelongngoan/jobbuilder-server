import express from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, getUserNotifications);
router.post("/", authenticate, createNotification);
router.put("/:id/read", authenticate, markNotificationAsRead);

export default router;
