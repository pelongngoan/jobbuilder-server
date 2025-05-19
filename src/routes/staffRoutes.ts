import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
} from "../controllers/staffController";
const staffRoutes = Router();

staffRoutes.get(
  "/",
  authenticate,
  requireRole(["company", "admin"]),
  getAllStaff
);
staffRoutes.post(
  "/",
  authenticate,
  requireRole(["company", "admin"]),
  createStaff
);
staffRoutes.get(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  getStaffById
);
staffRoutes.put(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  updateStaff
);

export default staffRoutes;
