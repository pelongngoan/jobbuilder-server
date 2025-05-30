import express from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  getUserNotifications(req, res);
});
router.post("/", authenticate, (req, res) => {
  createNotification(req, res);
});
router.put("/:id/read", authenticate, (req, res) => {
  markNotificationAsRead(req, res);
});
router.put("/mark-all-read", authenticate, (req, res) => {
  markAllNotificationsAsRead(req, res);
});
router.delete("/:id", authenticate, (req, res) => {
  deleteNotification(req, res);
});

export default router;
