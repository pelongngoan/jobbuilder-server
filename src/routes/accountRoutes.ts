import { Router } from "express";
import { login, signup } from "../controllers/accountController";

const accountRoutes = Router();
accountRoutes.post("/signup", signup);
accountRoutes.post("/login", login);
export default accountRoutes;
