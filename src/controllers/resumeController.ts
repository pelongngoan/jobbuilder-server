import { Request, Response } from "express";
import { Resume } from "../database/models/Resume";
import fs from "fs";
import path from "path";

export const createResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const { title, type, fileUrl, isDefault, content } = req.body;
    await Resume.create({
      userId,
      title,
      type,
      fileUrl,
      isDefault,
      content,
    });
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

export const getResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const resume = await Resume.find({ userId });
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
export const updateResume = async (req: Request, res: Response) => {
  try {
    const resumeId = req.params.resumeId;
    const { title, type, fileUrl, isDefault, content } = req.body;
    await Resume.findByIdAndUpdate(resumeId, {
      title,
      type,
      fileUrl,
      isDefault,
      content,
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
    const resumeId = req.params.resumeId;

    // Get resume details before deleting
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    // If resume is uploaded type, delete the file
    if (resume.type === "uploaded" && resume.fileUrl) {
      const filePath = path.join(
        process.cwd(),
        "uploads/resumes",
        resume.fileUrl
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Resume.findByIdAndDelete(resumeId);

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

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const resumeId = req.params.resumeId;
    const resume = await Resume.findById(resumeId);
    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get resume by id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getResumeByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const resume = await Resume.find({ userId });
    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get resume by user id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;

    // Check if file exists
    if (!req.file) {
      res.status(400).json({
        success: false,
        message:
          "No file uploaded or file type not supported. Only PDF files are allowed.",
      });
      return;
    }

    const fileUrl = req.file.filename;
    const { title, isDefault } = req.body;

    const resume = await Resume.create({
      title,
      userId,
      fileUrl,
      type: "uploaded",
      isDefault: isDefault === "true",
    });

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        fileUrl,
        resume,
      },
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
