import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Types } from "mongoose";
import { User } from "../database/models/User";
import { Profile } from "../database/models/Profile";
import { Settings } from "../database/models/Settings";

dotenv.config();

// Middleware to verify JWT Token (for protected routes)
export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

// 🔹 Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Assuming req.userId is set by authentication middleware
    const userProfile = await Profile.findOne({ userId });

    if (!userProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get User Settings
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userSettings = await Settings.findOne({ userId });

    if (!userSettings) {
      res.status(404).json({ message: "Settings not found" });
      return;
    }

    res.status(200).json(userSettings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update User Settings
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updatedSettings = await Settings.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedSettings) {
      res.status(404).json({ message: "Settings not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Settings updated successfully", updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect current password" });
      return;
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete User Account
export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    await Profile.deleteOne({ userId });
    await Settings.deleteOne({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
