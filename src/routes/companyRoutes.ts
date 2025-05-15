import express from "express";
import {
  getCompanyProfile,
  getCompanyById,
  getCompanyBySlug,
  updateCompanyProfile,
  getCompanyJobs,
  deleteCompanyAccount,
  getAllCompanies,
  searchCompanies,
  createCompanyProfile,
  searchCompaniesByName,
  getCompanyStaff,
  getCompanyStaffById,
  getCompanyStaffByRole,
  createCompanyStaff,
  updateCompanyStaff,
  updateCompanyStaffActive,
  deleteCompanyStaff,
} from "../controllers/companyController";
import {
  authenticate,
  requireRole,
  includeCompanyProfile,
} from "../middleware/authMiddleware";

const companyRoutes = express.Router();

// Company profile routes (requires company role)
companyRoutes.post(
  "/profile",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    createCompanyProfile(req, res).catch(next);
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
companyRoutes.get(
  "/profile",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyProfile(req, res).catch(next);
  }
);
companyRoutes.get("/:companyId", authenticate, (req, res, next) => {
  getCompanyById(req, res).catch(next);
});
companyRoutes.get("/slug/:slug", authenticate, (req, res, next) => {
  getCompanyBySlug(req, res).catch(next);
});
companyRoutes.get("/", authenticate, (req, res, next) => {
  getAllCompanies(req, res).catch(next);
});
companyRoutes.post("/name", authenticate, (req, res, next) => {
  searchCompaniesByName(req, res).catch(next);
});
companyRoutes.post("/search/query", authenticate, (req, res, next) => {
  searchCompanies(req, res).catch(next);
});
// Company jobs
companyRoutes.get("/jobs", authenticate, (req, res, next) => {
  getCompanyJobs(req, res).catch(next);
});
// Company staff
companyRoutes.get(
  "/staff",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyStaff(req, res).catch(next);
  }
);
companyRoutes.get(
  "/staff/:staffId",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyStaffById(req, res).catch(next);
  }
);
companyRoutes.get(
  "/staff/role/:role",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    getCompanyStaffByRole(req, res).catch(next);
  }
);
companyRoutes.post(
  "/staff",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    createCompanyStaff(req, res).catch(next);
  }
);
companyRoutes.put(
  "/staff/:staffId",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    updateCompanyStaff(req, res).catch(next);
  }
);
companyRoutes.put(
  "/staff/active",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    updateCompanyStaffActive(req, res).catch(next);
  }
);
companyRoutes.delete(
  "/staff/:staffId",
  authenticate,
  requireRole("company"),
  (req, res, next) => {
    deleteCompanyStaff(req, res).catch(next);
  }
);

export default companyRoutes;
