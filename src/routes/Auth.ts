import { Router } from "express";
import { login, register, testPassword } from "../controllers/Auth";

export const authRoutes = Router();
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/test", testPassword);
