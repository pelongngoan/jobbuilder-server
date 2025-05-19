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
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profilePicture = req.file?.path;
    const { firstName, lastName, email, phone, address } = req.body;
    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        profilePicture,
        firstName,
        lastName,
        email,
        phone,
        address,
      },
      { new: true }
    );
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: profile });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
