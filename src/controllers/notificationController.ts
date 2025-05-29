import { Request, Response } from "express";
import { Notification } from "../database/models/Notification";
export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = req.userProfileId;

  try {
    const notifications = await Notification.find({ userId });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  const { userId, type, content } = req.body;

  try {
    const notification = await Notification.create({ userId, type, content });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to create notification" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};
