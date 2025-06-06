import { Request, Response } from "express";
import dotenv from "dotenv";
import { UserProfile } from "../database/models/UserProfile";
import { Resume } from "../database/models/Resume";
import { getRelativeFilePath } from "../utils/fileUpload";
import { Profile } from "../database/models/Profile";
import { Job } from "../database/models/Job";
import { CompanyProfile, StaffProfile, User } from "../database/models";
import fs from "fs";
import csv from "csv-parser";
dotenv.config();

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, phone, profilePicture, address } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !profilePicture ||
      !address
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingProfile = await Profile.findOne({ userId });

    if (existingProfile) {
      res.status(400).json({ message: "Profile already exists" });
      return;
    }

    const profile = await Profile.create({
      userId,
      firstName,
      lastName,
      email,
      phone,
      profilePicture,
      address,
    });

    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { profile: profile._id },
      { new: true }
    );
    if (!userProfile) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("Create profile error:", error);
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, phone, profilePicture, address } =
      req.body;

    const profile = await Profile.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      email,
      phone,
      profilePicture,
      address,
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const userProfile = await UserProfile.findOne({
      userId,
    })
      .populate("profile")
      .populate("applications")
      .populate("savedJobs")
      .populate("resumes")
      .populate("userId");

    if (!userProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { savedJobs: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { savedJobs: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job unsaved successfully",
    });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { applications: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Applied to job successfully",
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const removeApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { applications: jobId } }
    );
    if (!updatedProfile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Application removed successfully",
    });
  } catch (error) {
    console.error("Remove application error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const createResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, isDefault, content } = req.body;

    const resume = new Resume({
      userId,
      title,
      type: "generated",
      content,
      isDefault,
    });

    await resume.save();

    if (isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
    });
  } catch (error) {
    console.error("Create resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const uploadResumeFile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, isDefault } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const fileUrl = getRelativeFilePath(file.path);

    const resume = new Resume({
      userId,
      title: title || file.originalname,
      type: "uploaded",
      fileUrl,
      isDefault: isDefault === "true" || isDefault === true,
    });

    await resume.save();

    if (resume.isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resume._id }, isDefault: true },
        { isDefault: false }
      );
    }

    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { resumes: resume._id } }
    );

    res.status(201).json({
      success: true,
      message: "Resume file uploaded successfully",
    });
  } catch (error) {
    console.error("Upload resume file error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const updateResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const updates = req.body;

    // Check if the resume belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    // If setting as default, update other resumes
    if (updates.isDefault) {
      await Resume.updateMany(
        { userId, _id: { $ne: resumeId }, isDefault: true },
        { isDefault: false }
      );
    }

    // Update resume
    const updatedResume = await Resume.findByIdAndUpdate(resumeId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    // Check if the resume belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    // Delete the resume
    await Resume.findByIdAndDelete(resumeId);

    // Remove from user profile
    await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { resumes: resumeId } }
    );

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getUserResumes = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get resumes without population first
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error("Get user resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getResumeById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    // Find resume without population first
    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .select("email password role isVerified")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const data: any[] = [];

    for (const user of users) {
      let userData: any = {
        _id: user._id,
        email: user.email,
        password: user.password,
        role: user.role,
        isVerified: user.isVerified,
      };

      if (user.role === "user") {
        const profile = await Profile.findOne({ userId: user._id }).select(
          "firstName lastName email phone address"
        );
        if (profile) {
          userData.firstName = profile.firstName;
          userData.lastName = profile.lastName;
          userData.email = profile.email;
          userData.phone = profile.phone;
          userData.address = profile.address;
        }
      } else if (user.role === "company") {
        const companyProfile = await CompanyProfile.findOne({
          userId: user._id,
        }).select("companyName domain address phone website");
        if (companyProfile) {
          userData.companyName = companyProfile.companyName;
          userData.domain = companyProfile.domain;
          userData.address = companyProfile.address;
          userData.phone = companyProfile.phone;
          userData.website = companyProfile.website;
        }
      }

      data.push(userData);
    }

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    let userData: any = {
      _id: user._id,
      email: user.email,
      password: user.password,
      role: user.role,
      isVerified: user.isVerified,
    };

    if (user.role === "user") {
      const profile = await Profile.findOne({ userId: user._id }).select(
        "firstName lastName email phone address"
      );
      if (profile) {
        userData.firstName = profile.firstName;
        userData.lastName = profile.lastName;
        userData.email = profile.email;
        userData.phone = profile.phone;
        userData.address = profile.address;
      }
    } else if (user.role === "company") {
      const companyProfile = await CompanyProfile.findOne({
        userId: user._id,
      }).select("companyName domain address phone website");
      if (companyProfile) {
        userData.companyName = companyProfile.companyName;
        userData.domain = companyProfile.domain;
        userData.address = companyProfile.address;
        userData.phone = companyProfile.phone;
        userData.website = companyProfile.website;
      }
    }
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
  }
};
export const importUsers = async (req: Request, res: Response) => {
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
    const users: {
      email: string;
      password: string;
      role: string;
      isVerified: boolean;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      companyName: string;
      domain: string;
      website: string;
    }[] = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        users.push({
          email: row.email,
          password: row.password,
          role: row.role,
          isVerified: row.isVerified?.toLowerCase() === "true",
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          address: row.address,
          companyName: row.companyName,
          domain: row.domain,
          website: row.website,
        });
      })
      .on("end", async () => {
        for (const user of users) {
          try {
            const existing = await User.findOne({ email: user.email });
            if (existing) {
              errors.push({
                email: user.email,
                reason: "Email already exists",
              });
              continue;
            }

            const newUser = await User.create({
              email: user.email,
              password: user.password,
              role: user.role,
              isVerified: user.isVerified,
            });
            switch (user.role) {
              case "user":
                const profile = await Profile.create({
                  userId: newUser._id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone,
                  address: user.address,
                }).then(async (profile) => {
                  await UserProfile.create({
                    userId: newUser._id,
                    profile: profile._id,
                  });
                });
                break;
              case "company":
                await CompanyProfile.create({
                  userId: newUser._id,
                  email: user.email,
                  companyName: user.companyName,
                  domain: user.domain,
                  address: user.address,
                  phone: user.phone,
                  website: user.website,
                });
                break;
              case "admin":
                await Profile.create({
                  userId: newUser._id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone,
                  address: user.address,
                });
                break;
            }

            imported.push({
              email: user.email,
              password: user.password,
            });
          } catch (err: any) {
            errors.push({
              email: user.email,
              reason: err.message,
            });
          }
        }

        fs.unlinkSync(file.path);

        res.status(201).json({
          success: true,
          message: "Users import completed",
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
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      role,
      isVerified,
      firstName,
      lastName,
      phone,
      address,
      companyName,
      website,
      domain,
    } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }
    const newUser = new User({ email, password, role, isVerified });
    await newUser.save();
    switch (role) {
      case "user":
        const profile = new Profile({
          userId: newUser._id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          address: address,
        });
        await profile.save().then((profile) => {
          const userProfile = new UserProfile({
            userId: newUser._id,
            profile: profile._id,
          });
          userProfile.save();
        });
        break;
      case "company":
        const companyProfile = new CompanyProfile({
          userId: newUser._id,
          email: email,
          companyName: companyName,
          domain: domain,
          address: address,
          phone: phone,
          website: website,
        });
        await companyProfile.save();
        break;
    }
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      email,
      password,
      role,
      isVerified,
      firstName,
      lastName,
      phone,
      address,
      companyName,
      website,
      domain,
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    switch (user?.role) {
      case "user":
        await Profile.findOneAndUpdate(
          { userId: user._id },
          {
            firstName,
            lastName,
            phone,
            address,
            email,
          }
        );
        break;
      case "company":
        await CompanyProfile.findOneAndUpdate(
          { userId: user._id },
          {
            companyName,
            website,
            domain,
            email,
          }
        );
        break;
    }
    await User.findByIdAndUpdate(userId, {
      email,
      password,
      isVerified,
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    switch (user?.role) {
      case "user":
        await UserProfile.findOneAndDelete({ userId: user._id });
        await Profile.findOneAndDelete({ userId: user._id });
        break;
      case "company":
        await CompanyProfile.findOneAndDelete({ userId: user._id });
        break;
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const users = await User.find({ email: { $regex: query, $options: "i" } })
      .skip((page - 1) * limit)
      .limit(limit);

    const data: any[] = [];

    for (const user of users) {
      let userData: any = {
        _id: user._id,
        email: user.email,
        password: user.password,
        role: user.role,
        isVerified: user.isVerified,
      };

      if (user.role === "user") {
        const profile = await Profile.findOne({ userId: user._id }).select(
          "firstName lastName email phone address"
        );
        if (profile) {
          userData.firstName = profile.firstName;
          userData.lastName = profile.lastName;
          userData.email = profile.email || user.email;
          userData.phone = profile.phone;
          userData.address = profile.address;
        }
      } else if (user.role === "company") {
        const companyProfile = await CompanyProfile.findOne({
          userId: user._id,
        }).select("companyName domain address phone website");
        if (companyProfile) {
          userData.companyName = companyProfile.companyName;
          userData.domain = companyProfile.domain;
          userData.address = companyProfile.address;
          userData.phone = companyProfile.phone;
          userData.website = companyProfile.website;
        }
      }

      data.push(userData);
    }

    const total = await User.countDocuments({
      email: { $regex: query, $options: "i" },
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
