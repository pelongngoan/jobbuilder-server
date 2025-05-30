import { Request, Response } from "express";
import { Application } from "../database/models/Application";
import { Job } from "../database/models/Job";
import { User } from "../database/models/User";
import { StaffProfile } from "../database/models/StaffProfile";
import { CompanyProfile } from "../database/models/CompanyProfile";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userProfileId;

    let stats: any = {};

    switch (role) {
      case "admin":
        stats = await getAdminStats();
        break;
      case "company":
        stats = await getCompanyStats(userId);
        break;
      case "staff":
        stats = await getStaffStats(userId);
        break;
      default:
        res.status(403).json({ message: "Access denied" });
        return;
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin statistics
const getAdminStats = async () => {
  const [totalUsers, totalCompanies, totalJobs, totalApplications] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      CompanyProfile.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

  const recentUsers = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("profile");

  const monthlyStats = await getMonthlyStats();

  return {
    totalUsers,
    totalCompanies,
    totalJobs,
    totalApplications,
    recentUsers,
    monthlyStats,
  };
};

// Company statistics
const getCompanyStats = async (companyId: string) => {
  const [
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
  ] = await Promise.all([
    Job.countDocuments({ companyId }),
    Job.countDocuments({ companyId, status: "active" }),
    Application.countDocuments({ companyId }),
    Application.countDocuments({ companyId, status: "pending" }),
    Application.countDocuments({ companyId, status: "accepted" }),
    Application.countDocuments({ companyId, status: "rejected" }),
  ]);

  const recentApplications = await Application.find({ companyId })
    .sort({ appliedAt: -1 })
    .limit(10)
    .populate({
      path: "userId",
      populate: {
        path: "profile",
        select: "firstName lastName email",
      },
    })
    .populate("jobId", "title")
    .populate("resumeId", "title");

  const recentJobs = await Job.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title location applicationCount status createdAt");

  const applicationsByStatus = {
    pending: pendingApplications,
    reviewed: await Application.countDocuments({
      companyId,
      status: "reviewed",
    }),
    shortlisted: await Application.countDocuments({
      companyId,
      status: "shortlisted",
    }),
    interview: await Application.countDocuments({
      companyId,
      status: "interview",
    }),
    accepted: acceptedApplications,
    rejected: rejectedApplications,
  };

  const monthlyApplications = await getMonthlyApplications(companyId);

  return {
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    recentApplications,
    recentJobs,
    applicationsByStatus,
    monthlyApplications,
  };
};

// Staff statistics
const getStaffStats = async (staffId: string) => {
  const [
    totalApplications,
    pendingReview,
    interviewsScheduled,
    applicationsReviewed,
  ] = await Promise.all([
    Application.countDocuments({ hrId: staffId }),
    Application.countDocuments({ hrId: staffId, status: "pending" }),
    Application.countDocuments({ interviewerId: staffId, status: "interview" }),
    Application.countDocuments({
      hrId: staffId,
      status: { $in: ["reviewed", "shortlisted", "accepted", "rejected"] },
    }),
  ]);

  const recentApplications = await Application.find({
    $or: [{ hrId: staffId }, { interviewerId: staffId }],
  })
    .sort({ appliedAt: -1 })
    .limit(10)
    .populate({
      path: "userId",
      populate: {
        path: "profile",
        select: "firstName lastName email",
      },
    })
    .populate("jobId", "title")
    .populate("resumeId", "title");

  const applicationsByStatus = {
    pending: pendingReview,
    reviewed: await Application.countDocuments({
      hrId: staffId,
      status: "reviewed",
    }),
    shortlisted: await Application.countDocuments({
      hrId: staffId,
      status: "shortlisted",
    }),
    interview: interviewsScheduled,
    accepted: await Application.countDocuments({
      hrId: staffId,
      status: "accepted",
    }),
    rejected: await Application.countDocuments({
      hrId: staffId,
      status: "rejected",
    }),
  };

  const todayApplications = await Application.countDocuments({
    hrId: staffId,
    appliedAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });

  return {
    totalApplications,
    pendingReview,
    interviewsScheduled,
    applicationsReviewed,
    recentApplications,
    applicationsByStatus,
    todayApplications,
  };
};

// Helper function for monthly statistics
const getMonthlyStats = async () => {
  const currentYear = new Date().getFullYear();
  const months = [];

  for (let i = 0; i < 12; i++) {
    const startDate = new Date(currentYear, i, 1);
    const endDate = new Date(currentYear, i + 1, 0);

    const [users, jobs, applications] = await Promise.all([
      User.countDocuments({
        role: "user",
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Job.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Application.countDocuments({
        appliedAt: { $gte: startDate, $lte: endDate },
      }),
    ]);

    months.push({
      month: startDate.toLocaleString("default", { month: "short" }),
      users,
      jobs,
      applications,
    });
  }

  return months;
};

// Helper function for monthly applications by company
const getMonthlyApplications = async (companyId: string) => {
  const currentYear = new Date().getFullYear();
  const months = [];

  for (let i = 0; i < 6; i++) {
    // Last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const applications = await Application.countDocuments({
      companyId,
      appliedAt: { $gte: startDate, $lte: endDate },
    });

    months.unshift({
      month: startDate.toLocaleString("default", { month: "short" }),
      applications,
    });
  }

  return months;
};
