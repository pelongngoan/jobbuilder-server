import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User, UserRole } from "../database/models/User";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { UserProfile } from "../database/models/UserProfile";
import { StaffProfile } from "../database/models/StaffProfile";

dotenv.config();

interface JwtPayload {
  userId: string;
}

// General authentication middleware to verify JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized - Account not found" });
      return;
    }
    let profile;
    switch (user.role) {
      case "user":
        req.userRole = "user";
        profile = await UserProfile.findOne({ userId: user._id });
        req.userProfileId = profile?._id.toString();
        break;
      case "staff":
        req.userRole = "staff";
        profile = await StaffProfile.findOne({ userId: user._id });
        req.staffProfileId = profile?._id.toString();
        break;
      case "company":
        req.userRole = "company";
        profile = await CompanyProfile.findOne({ userId: user._id });
        req.companyProfileId = profile?._id.toString();
        break;
      case "admin":
        console.log("admin");
        req.userRole = "admin";
        break;
      default:
        res.status(401).json({ message: "Unauthorized - Invalid user role" });
        return;
    }
    req.userId = user._id.toString();
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.userRole);
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      if (!req.userRole || !allowedRoles.includes(req.userRole)) {
        res.status(403).json({
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
};

// // Middleware to include HR profile data
// export const includeHRProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (req.userRole !== "hr") {
//       res.status(403).json({ message: "Not an HR user" });
//       return;
//     }

//     const hrProfile = await HRProfile.findOne({ userId: req.userId });
//     if (!hrProfile) {
//       res.status(404).json({ message: "HR profile not found" });
//       return;
//     }

//     req.hrProfile = hrProfile;
//     req.companyId = hrProfile.companyId.toString();

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Middleware to include Company profile data
// export const includeCompanyProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (req.userRole !== "company") {
//       res.status(403).json({ message: "Not a company user" });
//       return;
//     }

//     const companyProfile = await CompanyProfile.findOne({ userId: req.userId });
//     if (!companyProfile) {
//       res.status(404).json({ message: "Company profile not found" });
//       return;
//     }

//     req.companyProfile = companyProfile;
//     req.companyId = companyProfile._id.toString();

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Middleware to include Admin profile data
// export const includeAdminProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (req.userRole !== "admin") {
//       res.status(403).json({ message: "Not an admin user" });
//       return;
//     }

//     const adminProfile = await AdminProfile.findOne({ userId: req.userId });
//     if (!adminProfile) {
//       res.status(404).json({ message: "Admin profile not found" });
//       return;
//     }

//     req.adminProfile = adminProfile;

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// HR verification middleware - combines authentication and HR role verification
// export const verifyHR = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // 1. First authenticate the user
//     const token = req.header("Authorization")?.split(" ")[1];

//     if (!token) {
//       res.status(401).json({ message: "Unauthorized - No token provided" });
//       return;
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as JwtPayload;

//     // Find the user
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       res.status(401).json({ message: "Unauthorized - User not found" });
//       return;
//     }

//     // Add user info to request
//     req.userId = user._id.toString();
//     req.userRole = user.role;

//     // 2. Check if user has HR role
//     if (user.role !== "staff") {
//       res.status(403).json({
//         message: "Access denied. HR role required",
//       });
//       return;
//     }

//     // 3. Get HR profile
//     const staffProfile = await StaffProfile.findOne({ userId: req.userId });
//     if (!staffProfile) {
//       res.status(404).json({ message: "Staff profile not found" });
//       return;
//     }

//     req.staffProfile = staffProfile;
//     req.companyId = staffProfile.companyId.toString();

//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Authentication failed", error });
//   }
// };

// User verification middleware - just authenticates any user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized - User not found" });
      return;
    }

    // Add user info to request
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    res.status(403).json({ message: "Authentication failed", error });
  }
};

// For backward compatibility - many routes import this as 'auth'
export const auth = authenticate;
