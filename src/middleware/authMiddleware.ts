import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HR } from "../database/models/HR";
import { User } from "../database/models/User";
import { Company } from "../database/models/Company";

dotenv.config();

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return; // ✅ Ensure function stops execution
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.userId = decoded.userId;

    next(); // ✅ Move to the next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return; // ✅ Stop execution
  }
};
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized - No Token" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "Unauthorized - Invalid User" });
      return;
    }

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
export const verifyCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized - No Token" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const company = await Company.findById(decoded.id);

    if (!company) {
      res.status(401).json({ message: "Unauthorized - Invalid User" });
      return;
    }

    req.companyId = company.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
// Middleware to verify HR authentication
export const verifyHR = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      hrId: string;
    };

    const hr = await HR.findById(decoded.hrId);
    if (!hr) {
      res.status(403).json({ message: "HR not found" });
      return;
    }

    req.hrId = hr._id.toString();
    req.companyId = hr.companyId.toString(); // Attach companyId from HR model
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
