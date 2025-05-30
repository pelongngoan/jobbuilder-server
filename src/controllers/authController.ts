import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { User } from "../database/models/User";
import { UserProfile } from "../database/models/UserProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { emailService } from "../utils/emailService";
import { Profile, StaffProfile } from "../database/models";

dotenv.config();

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      companyName,
      domain,
      address,
      website,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const newUser = new User({
      email,
      password,
      role,
      isVerified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await newUser.save();

    switch (role) {
      case "user":
        const profile = new Profile({
          userId: newUser._id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        });
        await profile.save().then((profile) => {
          const userProfile = new UserProfile({
            userId: newUser._id,
            profile: profile._id,
          });
          userProfile.save();
        });
        break;
      case "company":
        const companyProfile = new CompanyProfile({
          userId: newUser._id,
          email: email,
          companyName: companyName,
          domain: domain,
          address: address,
          phoneNumber: phoneNumber,
          website: website,
        });
        await companyProfile.save();
        break;
    }

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
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
// 🔹 Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id.toString(), user.role);

    let profile;
    switch (user.role) {
      case "user":
        profile = await UserProfile.findOne({ userId: user._id });
        break;
      case "company":
        profile = await CompanyProfile.findOne({ userId: user._id });
        break;
      case "staff":
        profile = await StaffProfile.findOne({ userId: user._id });
        break;
      case "admin":
        break;
    }
    res.status(200).json({
      success: true,
      token,
      id: user._id,
      role: user.role,
      useProfileId: profile?._id || null,
      companyProfileId: profile?.companyId || null,
      companyId: profile?.companyId || null,
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
export const logout = async (req: Request, res: Response) => {
  try {
    // const { token } = req.body;
    const userId = req.userId;
    const user = await User.findByIdAndUpdate(
      { userId },
      { lastLogin: new Date() }
    );
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email has been sent. Please check your email.",
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
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await emailService.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset email has been sent. Please check your email.",
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
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
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
    user.password = password;
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
