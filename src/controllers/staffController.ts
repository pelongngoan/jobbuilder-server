import { Request, Response } from "express";
import {
  CompanyProfile,
  Job,
  JobCategory,
  Profile,
  StaffProfile,
  User,
} from "../database/models";
import { remove as removeDiacritics } from "diacritics"; // Or use custom diacritic remover
import fs from "fs";
import csv from "csv-parser";
import crypto from "crypto";
function generateRandomPassword(length = 10): string {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    let companyId = req.companyProfileId;
    let staffId = req.staffProfileId;
    if (!companyId) {
      const staff = await StaffProfile.findById(staffId);
      if (!staff) {
        res.status(400).json({ message: "Staff ID is required" });
        return;
      }
      companyId = staff.companyId.toString();
    }
    const staff = await StaffProfile.find({ companyId })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate("profile")
      .populate("jobPosts")
      .populate("applications")
      .populate("userId");
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const createStaff = async (req: Request, res: Response) => {
  try {
    const companyId = req.companyProfileId;
    const { password, role, active, firstName, lastName } = req.body;

    if (!password || !role || !firstName || !lastName) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const companyProfile = await CompanyProfile.findById(companyId);
    if (!companyProfile) {
      res.status(404).json({ message: "Company profile not found" });
      return;
    }

    // Generate email prefix
    const nameParts = removeDiacritics(lastName.toLowerCase()).split(" ");
    const initials = nameParts.map((word) => word[0]).join("");
    const cleanLastName = removeDiacritics(firstName.toLowerCase()).trim();
    const emailPrefix = `${cleanLastName}${initials}`;

    const regex = new RegExp(`^${emailPrefix}\\d*@${companyProfile.domain}$`);
    const similarEmails = await User.find({ email: { $regex: regex } });
    const email = `${emailPrefix}${similarEmails.length + 1}@${
      companyProfile.domain
    }`;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const user = await User.create({
      email,
      password,
      role: "staff",
      isVerified: true,
    });

    const profile = await Profile.create({
      userId: user._id,
      firstName,
      lastName,
      email,
    });

    const staff = await StaffProfile.create({
      userId: user._id,
      companyId: companyProfile._id,
      profile: profile._id,
      role,
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
    });
  } catch (error) {
    console.error("Create company staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const staff = await StaffProfile.findById(id)
      .populate("companyId")
      .populate("profile")
      .populate("jobPosts")
      .populate("applications");
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff by id error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, active } = req.body;
    const staff = await StaffProfile.findByIdAndUpdate(
      id,
      { role, active },
      { new: true }
    );
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.status(200).json({
      message: "Staff updated successfully",
      data: staff,
      success: true,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await StaffProfile.findById(id);
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    await Profile.findByIdAndDelete(staff.profile);
    await StaffProfile.findByIdAndDelete(id);
    await User.findByIdAndDelete(staff.userId);
    res.status(200).json({
      message: "Staff deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const searchStaff = async (req: Request, res: Response) => {
  try {
    const { role, email, page, limit, companyId } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Handle companyId - use from query if provided and not empty, otherwise use from req
    let finalCompanyId = req.companyProfileId;
    if (companyId && companyId !== "") {
      finalCompanyId = companyId as string;
    }

    // If no companyId available, check if we can get it from staff profile
    if (!finalCompanyId) {
      const staffId = req.staffProfileId;
      if (staffId) {
        const staff = await StaffProfile.findById(staffId);
        if (staff) {
          finalCompanyId = staff.companyId.toString();
        }
      }
    }

    if (!finalCompanyId) {
      res.status(400).json({ message: "Company ID is required" });
      return;
    }

    const profile = await Profile.find({
      email: { $regex: email || "", $options: "i" },
    });
    let staffs: any[] = [];
    for (const p of profile) {
      const staff = await StaffProfile.find({
        companyId: finalCompanyId,
        profile: p._id,
        role: { $regex: role || "", $options: "i" },
      })
        .populate("userId")
        .sort({ createdAt: -1 });
      staffs.push(...staff);
    }
    const total = staffs.length;
    staffs = staffs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      data: staffs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Search staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const importStaff = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const imported: any[] = [];
  const errors: any[] = [];

  try {
    const companyId = req.companyProfileId;
    const company = await CompanyProfile.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    const staffs: {
      firstName: string;
      lastName: string;
      role: string;
      active: boolean;
    }[] = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        staffs.push({
          firstName: row.firstName,
          lastName: row.lastName,
          role: row.role,
          active: row.active?.toLowerCase() === "true",
        });
      })
      .on("end", async () => {
        for (const staff of staffs) {
          try {
            const nameParts = removeDiacritics(
              staff.lastName.toLowerCase()
            ).split(" ");
            const initials = nameParts.map((word) => word[0]).join("");
            const cleanLastName = removeDiacritics(
              staff.firstName.toLowerCase()
            ).trim();
            const emailPrefix = `${cleanLastName}${initials}`;

            const regex = new RegExp(`^${emailPrefix}\\d*@${company.domain}$`);
            const similarEmails = await User.find({ email: { $regex: regex } });
            const email = `${emailPrefix}${similarEmails.length + 1}@${
              company.domain
            }`;

            const existing = await User.findOne({ email });
            if (existing) {
              errors.push({ email, reason: "Email already exists" });
              continue;
            }

            // const randomPassword = generateRandomPassword();
            const randomPassword = "12345678";
            const user = await User.create({
              email,
              password: randomPassword,
              role: "staff",
              isVerified: true,
            });

            const profile = await Profile.create({
              userId: user._id,
              firstName: staff.firstName,
              lastName: staff.lastName,
              email,
            });

            const newStaff = await StaffProfile.create({
              userId: user._id,
              companyId: company._id,
              profile: profile._id,
              role: staff.role,
              active: staff.active ?? true,
            });

            imported.push({
              email,
              password: randomPassword,
              name: `${staff.firstName} ${staff.lastName}`,
            });
          } catch (err: any) {
            errors.push({
              name: `${staff.firstName} ${staff.lastName}`,
              reason: err.message,
            });
          }
        }

        fs.unlinkSync(file.path);

        res.status(201).json({
          success: true,
          message: "Staff import completed",
          imported: imported.length,
          errors,
          data: imported,
        });
      });
  } catch (error: any) {
    console.error("CSV import error:", error);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json({
      success: false,
      message: "CSV import error",
      error: error.message || "Unknown error",
    });
  }
};
