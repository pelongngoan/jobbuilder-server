import { Router } from "express";
import {
  login,
  registerUser,
  registerCompany,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from "../controllers/authController";

export const authRoutes = Router();

// Fix route handlers by ensuring the callback doesn't return the Response
authRoutes.post("/signup/user", (req, res, next) => {
  registerUser(req, res).catch(next);
});

authRoutes.post("/signup/company", (req, res, next) => {
  registerCompany(req, res).catch(next);
});

authRoutes.post("/login", (req, res, next) => {
  login(req, res).catch(next);
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
