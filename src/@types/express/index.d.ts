import { UserRole } from "../../database/models/User";
import { IUserProfile } from "../../database/models/UserProfile";
import { ICompanyProfile } from "../../database/models/CompanyProfile";
import { IStaffProfile } from "../../database/models/StaffProfile";

declare global {
  namespace Express {
    // augment the Request interface
    interface Request {
      userId?: string;
      userRole?: UserRole;
      userProfileId?: string;
      companyProfileId?: string;
      staffProfileId?: string;
    }
  }
}

// This is needed to make it a module
export {};
