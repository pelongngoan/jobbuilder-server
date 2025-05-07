import express from "express";
import {
  getHRProfile,
  updateHRProfile,
  addHRToCompany,
  getCompanyHRs,
  updateHRPermissions,
  removeHRFromCompany,
} from "../controllers/hrController";
import {
  authenticate,
  requireRole,
  includeHRProfile,
} from "../middleware/authMiddleware";

const hrRoutes = express.Router();

// HR profile routes (requires HR role)
hrRoutes.get("/profile", authenticate, requireRole("hr"), (req, res, next) => {
  getHRProfile(req, res).catch(next);
});

hrRoutes.put("/profile", authenticate, requireRole("hr"), (req, res, next) => {
  updateHRProfile(req, res).catch(next);
});

// Company HR management routes (requires Company role or HR with permissions)
hrRoutes.post(
  "/company/:companyId",
  authenticate,
  requireRole(["company", "admin"]),
  (req, res, next) => {
    addHRToCompany(req, res).catch(next);
  }
);

hrRoutes.get("/company/:companyId", authenticate, (req, res, next) => {
  getCompanyHRs(req, res).catch(next);
});

hrRoutes.put(
  "/:hrId/permissions",
  authenticate,
  requireRole(["company", "admin"]),
  (req, res, next) => {
    updateHRPermissions(req, res).catch(next);
  }
);

hrRoutes.delete(
  "/:hrId",
  authenticate,
  requireRole(["company", "admin"]),
  (req, res, next) => {
    removeHRFromCompany(req, res).catch(next);
  }
);

export default hrRoutes;
