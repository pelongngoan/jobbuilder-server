import { Request, Response } from "express";
import { Job } from "../database/models/Job";
import { User } from "../database/models/User";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { Profile, StaffProfile } from "../database/models";
import fs from "fs";
import csv from "csv-parser";

export const createCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      companyName,
      phone,
      address,
      logo,
      website,
      wallPaper,
      description,
    } = req.body;
    if (
      !companyName ||
      !phone ||
      !address ||
      !logo ||
      !website ||
      !wallPaper ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const companyProfile = await CompanyProfile.create({
      userId,
      companyName,
      phone,
      address,
      logo,
      website,
      wallPaper,
      description,
      slug: companyName.toLowerCase().replace(/ /g, "-"),
    });
    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      data: companyProfile,
    });
  } catch (error) {
    console.error("Create company profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const logo = files?.logo?.[0]?.filename;
    const wallPaper = files?.wallPaper?.[0]?.filename;
    const { companyName, phone, website, description, address, email, domain } =
      req.body;

    // Create URLs for the files
    const logoUrl = logo ? `/uploads/${logo}` : undefined;
    const wallPaperUrl = wallPaper ? `/uploads/${wallPaper}` : undefined;

    // Try to find existing profile
    let companyProfile = await CompanyProfile.findOne({ userId });

    if (!companyProfile) {
      // If profile doesn't exist, create a new one
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      companyProfile = await CompanyProfile.create({
        userId,
        companyName,
        email: user.email,
        domain,
        phone,
        address,
        logo: logoUrl,
        wallPaper: wallPaperUrl,
        website,
        description,
        slug: companyName.toLowerCase().replace(/ /g, "-"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: "Company profile created successfully",
        data: companyProfile,
      });
    }

    // If profile exists, update it
    companyProfile = await CompanyProfile.findOneAndUpdate(
      { userId },
      {
        companyName,
        email,
        domain,
        phone,
        address,
        ...(logoUrl && { logo: logoUrl }),
        ...(wallPaperUrl && { wallPaper: wallPaperUrl }),
        website,
        description,
        slug: companyName.toLowerCase().replace(/ /g, "-"),
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: companyProfile,
    });
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const companyProfile = await CompanyProfile.findOne({ userId });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.status(200).json({
      success: true,
      data: companyProfile,
    });
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const companyProfile = await CompanyProfile.findById(companyId);

    if (!companyProfile) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({
      data: companyProfile,
      success: true,
    });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const companyProfile = await CompanyProfile.findOne({ slug });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      success: true,
      data: companyProfile,
    });
  } catch (error) {
    console.error("Get company by slug error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const companies = await CompanyProfile.find()
      .populate("userId")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await CompanyProfile.countDocuments();

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all companies error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const searchCompaniesByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const companies = await CompanyProfile.find({
      companyName: { $regex: name, $options: "i" },
    })
      .select("companyName address description logo slug")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await CompanyProfile.countDocuments({
      companyName: { $regex: name, $options: "i" },
    });

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search companies error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const searchCompanies = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchQuery: any = {};

    // Text search on company name and description
    if (query) {
      searchQuery.$or = [
        { companyName: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
      ];
    }

    const companies = await CompanyProfile.find(searchQuery)
      .select("companyName address description logo slug")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await CompanyProfile.countDocuments(searchQuery);

    res.status(200).json({
      data: companies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Search companies error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyStaff = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const companyProfile = await CompanyProfile.findOne({ userId });
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const staff = await StaffProfile.find({
      companyId: companyProfile._id,
    }).populate("userId");

    const total = await StaffProfile.countDocuments({
      companyId: companyProfile._id,
    });

    res.status(200).json({
      success: true,
      data: staff,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get company staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyStaffById = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const staff = await StaffProfile.findById(staffId)
      .populate("profile")
      .populate("jobPosts")
      .populate("applications")
      .populate("userId");
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error("Get company staff by id error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getCompanyStaffByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const userId = req.userId;
    const companyProfile = await CompanyProfile.findOne({ userId });
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    const staff = await StaffProfile.find({
      role,
      companyId: companyProfile._id,
    }).populate("userId");
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error("Get company staff by role error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const createCompanyStaff = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { password, role, active, fullName } = req.body;

    const companyProfile = await CompanyProfile.findOne({ userId });
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    if (!password || !role || !active || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const nameParts = fullName.trim().toLowerCase().split(" ");
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, -1).join(" ");
    const initials = nameParts
      .slice(0, -1)
      .map((word) => word[0])
      .join("");
    const emailPrefix = `${lastName}${initials}`;

    const regex = new RegExp(`^${emailPrefix}\\d*@${companyProfile.domain}$`);
    const similarEmails = await User.find({ email: { $regex: regex } });
    const email = `${emailPrefix}${similarEmails.length + 1}@${
      companyProfile.domain
    }`;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      email,
      password,
      role: "staff",
      isVerified: true,
    });

    const profile = await Profile.create({
      userId: user._id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: "",
      address: "",
      profilePicture: "",
    });
    await profile.save();
    const staff = await StaffProfile.create({
      userId: user._id,
      companyId: companyProfile._id,
      profile: profile._id,
      role,
      active,
    });
    await staff.save();
    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Create company staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const importCompanyStaffFromCSV = async (
  req: Request,
  res: Response
) => {
  const file = req.file;
  const companyId = req.companyProfileId;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!companyId) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: "Company ID is required" });
  }
  const companyProfile = await CompanyProfile.findById(companyId);
  if (!companyProfile) {
    fs.unlinkSync(file.path);
    return res.status(404).json({ message: "Company not found" });
  }

  const staffToCreate: any[] = [];
  const errors: any[] = [];

  try {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", async (row) => {
        const fullName = row.fullName;
        const nameParts = fullName.trim().toLowerCase().split(" ");
        const lastName = nameParts[nameParts.length - 1];
        const initials = nameParts
          .slice(0, -1)
          .map((word) => word[0])
          .join("");
        const emailPrefix = `${lastName}${initials}`;

        const regex = new RegExp(
          `^${emailPrefix}\\d*@${companyProfile.domain}$`
        );
        const similarEmails = await User.find({ email: { $regex: regex } });
        const email = `${emailPrefix}${similarEmails.length + 1}@${
          companyProfile.domain
        }`;
        // Generate random password if not provided
        const password = row.password || Math.random().toString(36).slice(-10);

        staffToCreate.push({
          email,
          password,
          role: row.role || "staff",
          active: row.active || false,
        });
      })
      .on("end", async () => {
        // Process each HR
        for (const staff of staffToCreate) {
          try {
            // Check if email is already in use
            const existingUser = await User.findOne({ email: staff.email });
            if (existingUser) {
              errors.push({
                email: staff.email,
                reason: "Email already in use",
              });
              continue;
            }

            // Create new user with HR role
            const newUser = new User({
              email: staff.email,
              password: staff.password,
              role: "staff",
            });
            await newUser.save();

            // Create HR profile
            const newStaffProfile = new StaffProfile({
              userId: newUser._id,
              companyId,
              role: staff.role,
              active: staff.active,
            });
            await newStaffProfile.save();
          } catch (err) {
            errors.push({
              email: staff.email,
              reason: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        res.status(201).json({
          success: true,
          message: "Staff imported successfully",
          errors,
        });
      });
  } catch (error) {
    console.error("CSV import error:", error);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json({
      message: "CSV import error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const updateCompanyStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const { password, role, active } = req.body;
    const staff = await StaffProfile.findByIdAndUpdate(staffId, {
      role,
      active,
    });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    const user = await User.findByIdAndUpdate(staff.userId, {
      password,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Update company staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateCompanyStaffActive = async (req: Request, res: Response) => {
  try {
    const { staffIds, active } = req.body;
    const staff = await StaffProfile.updateMany(
      { _id: { $in: staffIds } },
      { active }
    );
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error("Update company staff active error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteCompanyStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const staff = await StaffProfile.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    await StaffProfile.findByIdAndDelete(staffId);
    await User.findByIdAndDelete(staff.userId);
    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("Delete company staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
