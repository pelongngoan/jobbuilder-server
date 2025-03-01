import { Router } from "express";
import { GoodMorning, HelloWorld } from "../controllers/Auth";

export const authRoutes = Router();
authRoutes.get("/", HelloWorld);
authRoutes.get("/goodMorning", GoodMorning);
