import { Request, Response } from "express";
import { Profile } from "../database/models/Profile";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ userId: id });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const { firstName, lastName, email, phone, address } = req.body;

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      address,
    };

    // Only update profilePicture if a new file was uploaded
    if (files?.profilePicture?.[0]?.filename) {
      updateData.profilePicture = files.profilePicture[0].filename;
    }
    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      updateData,
      { new: true } // This returns the updated document
    );

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
