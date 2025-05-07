import express from "express";
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  incrementSkillPopularity,
  searchSkills,
  getTrendingSkills,
  bulkCreateSkills,
} from "../controllers/skillController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getAllSkills);
router.get("/search", searchSkills);
router.get("/trending", getTrendingSkills);
router.get("/:id", getSkillById);

// Protected routes - only admin and HR should be able to manage skills
router.post("/", authenticate, requireRole(["admin", "hr"]), createSkill);
router.post(
  "/bulk",
  authenticate,
  requireRole(["admin", "hr"]),
  bulkCreateSkills
);
router.put("/:id", authenticate, requireRole(["admin", "hr"]), updateSkill);
router.delete("/:id", authenticate, requireRole(["admin", "hr"]), deleteSkill);

// Misc routes
router.post("/:id/increment-popularity", incrementSkillPopularity);

export default router;
