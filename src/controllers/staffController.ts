import { Request, Response } from "express";
import {
  CompanyProfile,
  Job,
  Profile,
  StaffProfile,
  User,
} from "../database/models";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const companyId = req.companyProfileId;
    if (!companyId) {
      res.status(400).json({ message: "Company ID is required" });
      return;
    }
    const staff = await StaffProfile.find({ companyId })
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

    const { password, role, active, fullName } = req.body;

    const companyProfile = await CompanyProfile.findById(companyId);
    if (!companyProfile) {
      res.status(404).json({ message: "Company profile not found" });
      return;
    }
    console.log(req.body);
    if (!password || !role || !fullName) {
      res.status(400).json({ message: "All fields are required" });
      return;
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
      firstName: firstName,
      lastName: lastName,
      email: email,
    });
    await profile.save();
    const staff = await StaffProfile.create({
      userId: user._id,
      companyId: companyProfile._id,
      profile: profile._id,
      role,
      active: active || true,
    });

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

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await StaffProfile.findOne({ userId: id })
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
    const { profile } = req.body;
    const staff = await StaffProfile.findByIdAndUpdate(
      id,
      { profile },
      { new: true }
    );
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Staff updated successfully", data: staff });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
