import { Router } from "express";
import { getProfile } from "../controllers/profileController";
import { updateProfile } from "../controllers/profileController";
import { authenticate, requireRole } from "../middleware/authMiddleware";
const profileRoutes = Router();

profileRoutes.get(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  getProfile
);
profileRoutes.put(
  "/:id",
  authenticate,
  requireRole(["company", "admin", "staff"]),
  updateProfile
);

export default profileRoutes;
