import { Request, Response } from "express";
import { Job } from "../database/models/Job";
import { User } from "../database/models/User";
import { CompanyProfile } from "../database/models/CompanyProfile";
import { HRProfile } from "../database/models/HRProfile";

// 🔹 Get Company Profile
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const companyProfile = await CompanyProfile.findOne({ userId })
      .populate("jobPosts")
      .populate("hrMembers", "-password");

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
      profile: companyProfile,
    });
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Company by ID (public view)
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const companyProfile = await CompanyProfile.findById(companyId).populate(
      "jobPosts"
    );

    if (!companyProfile) {
      return res.status(404).json({ message: "Company not found" });
    }

    const user = await User.findById(companyProfile.userId).select(
      "name email profilePicture"
    );

    res.status(200).json({
      user,
      profile: companyProfile,
    });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Company by Slug (public view)
export const getCompanyBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const companyProfile = await CompanyProfile.findOne({ slug }).populate(
      "jobPosts"
    );

    if (!companyProfile) {
      return res.status(404).json({ message: "Company not found" });
    }

    const user = await User.findById(companyProfile.userId).select(
      "name email profilePicture"
    );

    res.status(200).json({
      user,
      profile: companyProfile,
    });
  } catch (error) {
    console.error("Get company by slug error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Company Profile
export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Update user basic info if provided
    if (
      req.body.name ||
      req.body.email ||
      req.body.phone ||
      req.body.location ||
      req.body.profilePicture
    ) {
      const userUpdates: any = {};

      if (req.body.name) userUpdates.name = req.body.name;
      if (req.body.email) userUpdates.email = req.body.email;
      if (req.body.phone) userUpdates.phone = req.body.phone;
      if (req.body.location) userUpdates.location = req.body.location;
      if (req.body.profilePicture)
        userUpdates.profilePicture = req.body.profilePicture;

      await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Handle company name separately to update slug
    let companyProfile;
    if (req.body.companyName) {
      companyProfile = await CompanyProfile.findOne({ userId });
      if (companyProfile) {
        companyProfile.companyName = req.body.companyName;
        await companyProfile.save(); // This will trigger the slug update
      }
    }

    // Prepare profile updates by removing user properties
    const profileUpdates = { ...req.body };
    [
      "name",
      "email",
      "phone",
      "location",
      "profilePicture",
      "password",
      "companyName",
    ].forEach((key) => {
      delete profileUpdates[key];
    });

    // Update the company profile
    if (Object.keys(profileUpdates).length > 0) {
      companyProfile = await CompanyProfile.findOneAndUpdate(
        { userId },
        { $set: profileUpdates },
        { new: true }
      );
    }

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Company profile updated successfully",
      user,
      profile: companyProfile,
    });
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get Company's Jobs
export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const companyProfile = await CompanyProfile.findOne({ userId });
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const jobs = await Job.find({ companyId: companyProfile._id })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Get company jobs error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete Company Account
export const deleteCompanyAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const companyProfile = await CompanyProfile.findOne({ userId });
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Delete associated HR profiles
    await HRProfile.deleteMany({ companyId: companyProfile._id });

    // Delete associated jobs
    await Job.deleteMany({ companyId: companyProfile._id });

    // Delete company profile
    await CompanyProfile.deleteOne({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Company account deleted successfully" });
  } catch (error) {
    console.error("Delete company account error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
