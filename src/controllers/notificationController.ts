import { Request, Response } from "express";
import { Notification } from "../database/models/Notification";

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, isRead } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const query: any = { userId };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const count = await Notification.countDocuments(query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create a new notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, content, referenceId, referenceModel } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      content,
      referenceId,
      referenceModel,
      isRead: false,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Mark all user notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get notification counts (unread vs total)
export const getNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const [totalCount, unreadCount] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
      },
    });
  } catch (error) {
    console.error("Get notification count error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Clean up old notifications (admin only)
export const cleanupOldNotifications = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.body;

    // Calculate the date threshold (e.g., 30 days ago)
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const result = await Notification.deleteMany({
      createdAt: { $lt: threshold },
      isRead: true, // Only delete read notifications
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old notifications`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
