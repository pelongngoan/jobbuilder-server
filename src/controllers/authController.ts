import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { User, UserRole } from "../database/models/User";
import { UserProfile } from "../database/models/UserProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { HRProfile } from "../database/models/HRProfile";
import { AdminProfile } from "../database/models/AdminProfile";

dotenv.config();

// 🔹 Generate JWT Token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

// 🔹 Register User
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, location, phone, bio, headline } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create new user with "user" role
    const newUser = new User({
      name,
      email,
      password,
      role: "user",
      phone,
      location,
      isVerified: false, // Require email verification
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    await newUser.save();

    // Create user profile
    const userProfile = new UserProfile({
      userId: newUser._id,
      headline: headline || "",
      bio: bio || "",
    });

    await userProfile.save();

    // In production, send verification email here
    // For development, just return the token

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email to login.",
      verificationToken, // In production, don't return this
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Register Company
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      industry,
      location,
      website,
      description,
      companySize,
      foundingYear,
    } = req.body;

    // Check if company already exists
    const existingCompany = await User.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create slug from company name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    // Check if slug is unique
    const slugExists = await CompanyProfile.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "Company name already taken. Please use a different name.",
      });
    }

    // Create new user with "company" role
    const newCompany = new User({
      name,
      email,
      password,
      role: "company",
      location,
      isVerified: false, // Require email verification
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    newCompany.verificationToken = verificationToken;
    newCompany.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    await newCompany.save();

    // Create company profile
    const companyProfile = new CompanyProfile({
      userId: newCompany._id,
      companyName: name,
      industry: industry || "",
      website: website || "",
      description: description || "",
      companySize: companySize || "1-10",
      foundingYear: foundingYear || new Date().getFullYear(),
      slug,
    });

    await companyProfile.save();

    // In production, send verification email here
    // For development, just return the token

    res.status(201).json({
      success: true,
      message:
        "Company registered successfully. Please verify your email to login.",
      verificationToken, // In production, don't return this
    });
  } catch (error) {
    console.error("Register company error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
      return;
    }

    // Mark the user as verified and remove the token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Resend Verification Email
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // In production, send verification email here
    // For development, just return the token

    res.status(200).json({
      success: true,
      message: "Verification email has been sent",
      verificationToken, // In production, don't return this
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Get user profile based on role
    let profile;
    switch (user.role) {
      case "user":
        profile = await UserProfile.findOne({ userId: user._id });
        break;
      case "company":
        profile = await CompanyProfile.findOne({ userId: user._id });
        break;
      case "hr":
        profile = await HRProfile.findOne({ userId: user._id });
        break;
      case "admin":
        profile = await AdminProfile.findOne({ userId: user._id });
        break;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
      profile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Forgot Password Controller
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store reset token in user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // In production, send reset token via email
    // For now, just returning it as a response
    res.status(200).json({
      success: true,
      message:
        "Reset token generated. In production, this would be sent via email.",
      resetToken, // In production, don't return this
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 🔹 Reset Password Controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with the reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
