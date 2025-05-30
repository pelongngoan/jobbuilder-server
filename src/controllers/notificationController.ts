import { Request, Response } from "express";
import { Notification } from "../database/models/Notification";

export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = req.userProfileId;
  const { page = 1, limit = 10, unreadOnly = false } = req.query;

  try {
    const filter: any = { userId };
    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  const { userId, type, content, title, relatedId, relatedType, actionUrl } =
    req.body;

  try {
    const notification = await Notification.create({
      userId,
      type,
      content,
      title,
      relatedId,
      relatedType,
      actionUrl,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userProfileId;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId }, // Ensure user can only mark their own notifications
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  const userId = req.userProfileId;

  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userProfileId;

  try {
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Helper function to create notifications (for internal use)
export const createNotificationHelper = async (notificationData: {
  userId: string;
  type: string;
  content: string;
  title: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
}) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
