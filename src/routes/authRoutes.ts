import { Router } from "express";
import { login, signup } from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";

export const authRoutes = Router();
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
