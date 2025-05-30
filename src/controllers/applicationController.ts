import { Request, Response } from "express";
import { Application } from "../database/models/Application";
import { Job } from "../database/models/Job";
import { Resume } from "../database/models/Resume";
import { Schema } from "mongoose";
import { createNotificationHelper } from "./notificationController";
import { io } from "../index";
import {
  emitNotification,
  emitToStaff,
  emitApplicationUpdate,
} from "../config/socket";

// 🔹 Apply for a Job (User Only)
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.userProfileId;
    const { resumeId } = req.body;

    // Check if the job exists
    const job = await Job.findById(jobId).populate("contacterId");
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    // Check if the resume exists
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(400).json({ message: "Invalid resume" });
      return;
    }

    // Check if the user has already applied for this job
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      res
        .status(400)
        .json({ message: "You have already applied for this job" });
      return;
    }

    // Create the application
    const newApplication = new Application({
      jobId,
      userId,
      hrId: job.contacterId,
      resumeId,
      companyId: job.companyId,
      status: "pending",
    });

    await newApplication.save();
    if (newApplication) {
      job.applications.push(
        newApplication._id as unknown as Schema.Types.ObjectId
      );
      job.applicationCount++;
      await job.save();
    }

    // Create notification for HR staff
    try {
      const hrNotification = await createNotificationHelper({
        userId: job.contacterId.toString(),
        type: "job_application",
        title: "New Job Application",
        content: `A new application has been received for ${job.title}`,
        relatedId: newApplication._id.toString(),
        relatedType: "application",
        actionUrl: `/staff/applications/${newApplication._id}`,
      });
      // Emit real-time notification to HR staff
      emitNotification(io, job.contacterId.toString(), hrNotification);
      emitToStaff(
        io,
        {
          type: "new_application",
          application: newApplication,
          job: job,
        },
        "new_application"
      );
    } catch (notificationError) {
      console.error("Error creating HR notification:", notificationError);
    }

    res
      .status(201)
      .json({ message: "Application submitted successfully", newApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a User
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.userProfileId;
    const applications = await Application.find({ userId })
      .populate("jobId")
      .populate("resumeId")
      .populate({
        path: "hrId",
        populate: {
          path: "profile",
          select: "email firstName lastName phone",
        },
      })
      .populate({
        path: "interviewerId",
        populate: {
          path: "profile",
          select: "email firstName lastName phone",
        },
      })
      .populate({
        path: "companyId",
        select: "companyName",
      })
      .populate({
        path: "userId",
        populate: {
          path: "profile",
          select: "email firstName lastName phone",
        },
      });

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a Company
export const getCompanyApplications = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const applications = await Application.find({ companyId })
      .populate("jobId")
      .populate("resumeId")
      .populate({
        path: "userId",
        populate: {
          path: "profile",
          select: "email firstName lastName phone",
        },
      });

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get a Specific Application by ID (User & HR)
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate({
        path: "jobId",
        select: "title companyId",
        populate: {
          path: "companyId",
          select: "companyName",
        },
      })
      .populate("resumeId", "title");
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a Job (HR Only)
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate("userId", "name email")
      .populate("resumeId", "title");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Update Application Status (HR Only)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status, interviewerId } = req.body;

    if (
      ![
        "pending",
        "reviewed",
        "shortlisted",
        "rejected",
        "interview",
        "accepted",
      ].includes(status)
    ) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const previousApplication = await Application.findById(
      applicationId
    ).populate({
      path: "jobId",
      select: "title",
    });
    if (!previousApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status, interviewerId },
      { new: true }
    ).populate({
      path: "jobId",
      select: "title",
    });

    if (!updatedApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Create notification for user about status change
    try {
      let notificationTitle = "";
      let notificationContent = "";

      const jobTitle =
        (updatedApplication.jobId as any)?.title || "the position";

      switch (status) {
        case "reviewed":
          notificationTitle = "Application Reviewed";
          notificationContent = `Your application for ${jobTitle} has been reviewed`;
          break;
        case "shortlisted":
          notificationTitle = "Application Shortlisted";
          notificationContent = `Congratulations! Your application for ${jobTitle} has been shortlisted`;
          break;
        case "interview":
          notificationTitle = "Interview Scheduled";
          notificationContent = `You have been scheduled for an interview for ${jobTitle}`;
          break;
        case "accepted":
          notificationTitle = "Application Accepted";
          notificationContent = `Congratulations! Your application for ${jobTitle} has been accepted`;
          break;
        case "rejected":
          notificationTitle = "Application Update";
          notificationContent = `Thank you for your interest in ${jobTitle}. Unfortunately, we have decided to proceed with other candidates`;
          break;
        default:
          notificationTitle = "Application Status Updated";
          notificationContent = `Your application status for ${jobTitle} has been updated to ${status}`;
      }

      const userNotification = await createNotificationHelper({
        userId: updatedApplication.userId.toString(),
        type: "application_status",
        title: notificationTitle,
        content: notificationContent,
        relatedId: updatedApplication._id.toString(),
        relatedType: "application",
        actionUrl: `/user/applications/${updatedApplication._id}`,
      });

      // Emit real-time notification to user
      emitNotification(
        io,
        updatedApplication.userId.toString(),
        userNotification
      );
      emitApplicationUpdate(
        io,
        updatedApplication.userId.toString(),
        updatedApplication
      );

      // If assigning to interviewer, create notification for interviewer
      if (status === "interview" && interviewerId) {
        const interviewerNotification = await createNotificationHelper({
          userId: interviewerId,
          type: "application_assigned",
          title: "Interview Assignment",
          content: `You have been assigned to interview a candidate for ${jobTitle}`,
          relatedId: updatedApplication._id.toString(),
          relatedType: "application",
          actionUrl: `/staff/applications/${updatedApplication._id}`,
        });

        emitNotification(io, interviewerId, interviewerNotification);
      }
    } catch (notificationError) {
      console.error(
        "Error creating status change notification:",
        notificationError
      );
    }

    res
      .status(200)
      .json({ message: "Application status updated", updatedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete Application (User Only)
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userProfileId;

    const application = await Application.findOneAndDelete({
      _id: applicationId,
      userId,
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Get All Applications for a Staff
export const getStaffApplications = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;

    const applications = await Application.find({ hrId: staffId })
      .populate("jobId")
      .populate("resumeId")
      .populate({
        path: "userId",
        populate: {
          path: "profile",
          select: "email firstName lastName phone",
        },
      });

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
