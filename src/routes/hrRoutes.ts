import express from "express";
import multer from "multer";
import {
  getHRProfile,
  updateHRProfile,
  addHRToCompany,
  getCompanyHRs,
  updateHRPermissions,
  removeHRFromCompany,
  getAllHRs,
  searchHRs,
  importHRsFromCSV,
} from "../controllers/staffController";
import {
  authenticate,
  requireRole,
  includeHRProfile,
} from "../middleware/authMiddleware";

// Storage config for CSV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

hrRoutes.post(
  "/company/:companyId/import",
  authenticate,
  requireRole(["company", "admin"]),
  upload.single("csvFile"),
  (req, res, next) => {
    importHRsFromCSV(req, res).catch(next);
  }
);

hrRoutes.get("/company/:companyId", authenticate, (req, res, next) => {
  getCompanyHRs(req, res).catch(next);
});

// Admin routes for managing all HRs
hrRoutes.get("/all", authenticate, requireRole("admin"), (req, res, next) => {
  getAllHRs(req, res).catch(next);
});

hrRoutes.get(
  "/search",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    searchHRs(req, res).catch(next);
  }
);

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
