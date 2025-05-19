import express from "express";
import {
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  getUserDetails,
  createAdminUser,
  changeUserRole,
  deleteUser,
} from "../controllers/adminController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const adminRoutes = express.Router();

// Admin profile routes
adminRoutes.get(
  "/profile",
  authenticate,
  requireRole("admin"),
  getAdminProfile
);
adminRoutes.put(
  "/profile",
  authenticate,
  requireRole("admin"),
  updateAdminProfile
);

// User management routes
adminRoutes.get("/users", authenticate, requireRole("admin"), getAllUsers);
adminRoutes.get(
  "/users/:userId",
  authenticate,
  requireRole("admin"),
  getUserDetails
);
adminRoutes.post(
  "/users/admin",
  authenticate,
  requireRole("admin"),
  createAdminUser
);
adminRoutes.put(
  "/users/:userId/role",
  authenticate,
  requireRole("admin"),
  changeUserRole
);
adminRoutes.delete(
  "/users/:userId",
  authenticate,
  requireRole("admin"),
  deleteUser
);

export default adminRoutes;
