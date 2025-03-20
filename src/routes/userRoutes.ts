import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  changePassword,
  deleteUserAccount,
} from "../controllers/userController";
import { authenticateUser, verifyUser } from "../middleware/authMiddleware";

const userRoutes = express.Router();

// 🔹 Profile Routes
userRoutes.get("/profile", verifyUser, getUserProfile); // ✅ Protected
userRoutes.put("/profile", verifyUser, updateUserProfile); // ✅ Protected

// 🔹 Settings Routes
userRoutes.get("/settings", verifyUser, getUserSettings); // ✅ Protected
userRoutes.put("/settings", verifyUser, updateUserSettings); // ✅ Protected

// 🔹 Account Routes
userRoutes.post("/change-password", verifyUser, changePassword); // ✅ Protected
userRoutes.delete("/delete-account", verifyUser, deleteUserAccount); // ✅ Protected

export default userRoutes;
