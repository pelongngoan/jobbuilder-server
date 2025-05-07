import express from "express";
import {
  getCompanyProfile,
  getCompanyById,
  getCompanyBySlug,
  updateCompanyProfile,
  getCompanyJobs,
  deleteCompanyAccount,
} from "../controllers/companyController";
import {
  authenticate,
  requireRole,
  includeCompanyProfile,
} from "../middleware/authMiddleware";

const companyRoutes = express.Router();

// Company profile routes (requires company role)
companyRoutes.get(
  "/profile",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyProfile(req, res).catch(next);
  }
);

companyRoutes.put(
  "/profile",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    updateCompanyProfile(req, res).catch(next);
  }
);

companyRoutes.delete(
  "/account",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    deleteCompanyAccount(req, res).catch(next);
  }
);

// Company jobs
companyRoutes.get(
  "/jobs",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyJobs(req, res).catch(next);
  }
);

// Public company routes
companyRoutes.get("/id/:companyId", (req, res, next) => {
  getCompanyById(req, res).catch(next);
});

companyRoutes.get("/slug/:slug", (req, res, next) => {
  getCompanyBySlug(req, res).catch(next);
});

export default companyRoutes;
