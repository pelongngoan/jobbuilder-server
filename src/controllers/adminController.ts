import { Request, Response } from "express";
import { User } from "../database/models/User";
import { AdminProfile } from "../database/models/AdminProfile";
import * as bcrypt from "bcrypt";

// Get admin profile
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminProfile = await AdminProfile.findOne({
      userId: req.userId,
    }).populate("userId", "email");

    if (!adminProfile) {
      res.status(404).json({ message: "Admin profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: adminProfile,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin profile",
      error,
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    const adminProfile = await AdminProfile.findOneAndUpdate(
      { userId: req.userId },
      { firstName, lastName, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!adminProfile) {
      res.status(404).json({ message: "Admin profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: adminProfile,
      message: "Admin profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile",
      error,
    });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error,
    });
  }
};

// Get user details
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get profile based on user role
    let profile;
    if (user.role === "admin") {
      profile = await AdminProfile.findOne({ userId: user._id });
    } else if (user.role === "staff") {
      // Assuming you have an HRProfile model
      profile = await import("../database/models/StaffProfile").then((module) =>
        module.StaffProfile.findOne({ userId: user._id })
      );
    } else if (user.role === "company") {
      // Assuming you have a CompanyProfile model
      profile = await import("../database/models/CompanyProfile").then(
        (module) => module.CompanyProfile.findOne({ userId: user._id })
      );
    }

    res.status(200).json({
      success: true,
      data: { user, profile },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error,
    });
  }
};

// Create admin user
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      role: "admin",
    });

    await newUser.save();

    // Create admin profile
    const adminProfile = new AdminProfile({
      userId: newUser._id,
      firstName,
      lastName,
      phoneNumber,
    });

    await adminProfile.save();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin user",
      error,
    });
  }
};

// Change user role
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;

    // Check if role is valid
    const validRoles = ["user", "admin", "hr", "company"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role specified" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error,
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete associated profile based on user role
    // if (user.role === "admin") {
    //   await AdminProfile.findOneAndDelete({ userId: user._id });
    // } else if (user.role === "hr") {
    //   // Assuming you have an HRProfile model
    //   await import("../database/models/HRProfile").then((module) =>
    //     module.HRProfile.findOneAndDelete({ userId: user._id })
    //   );
    // } else if (user.role === "company") {
    //   // Assuming you have a CompanyProfile model
    //   await import("../database/models/CompanyProfile").then((module) =>
    //     module.CompanyProfile.findOneAndDelete({ userId: user._id })
    //   );
    // }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error,
    });
  }
};
