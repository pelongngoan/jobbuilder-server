import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getSaveJob,
  deleteSavedJob,
  saveJob,
} from "../controllers/saveJobController";
const saveJobRoutes = express.Router();

saveJobRoutes.post("/:jobId", authenticate, saveJob);
saveJobRoutes.delete("/:jobId", authenticate, deleteSavedJob);
saveJobRoutes.get("/", authenticate, getSaveJob);

export default saveJobRoutes;
