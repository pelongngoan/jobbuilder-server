import { Router, Request, Response } from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  register,
  logout,
} from "../controllers/authController";
import { emailService } from "../utils/emailService";

export const authRoutes = Router();

authRoutes.post("/register", (req, res, next) => {
  register(req, res).catch(next);
});

authRoutes.post("/login", (req, res, next) => {
  login(req, res).catch(next);
});
authRoutes.post("/logout", (req, res, next) => {
  logout(req, res).catch(next);
});
authRoutes.get("/verify-email/:token", (req, res, next) => {
  verifyEmail(req, res).catch(next);
});

authRoutes.post("/resend-verification", (req, res, next) => {
  resendVerification(req, res).catch(next);
});

authRoutes.post("/forgot-password", (req, res, next) => {
  forgotPassword(req, res).catch(next);
});

authRoutes.post("/reset-password", (req, res, next) => {
  resetPassword(req, res).catch(next);
});

// Test endpoint for email sending (development only)
if (process.env.NODE_ENV !== "production") {
  authRoutes.post("/test-email", (req, res, next) => {
    sendTestEmail(req, res).catch(next);
  });
}

// Function to send test email
async function sendTestEmail(req: Request, res: Response) {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required",
      });
    }

    const testToken = "test-verification-token-" + Date.now();
    const result = await emailService.sendVerificationEmail(email, testToken);

    if (result) {
      res.status(200).json({
        success: true,
        message: "Test email sent successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
