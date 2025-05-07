import { UserRole } from "../../database/models/User";
import { IUserProfile } from "../../database/models/UserProfile";
import { ICompanyProfile } from "../../database/models/CompanyProfile";
import { IHRProfile } from "../../database/models/HRProfile";
import { IAdminProfile } from "../../database/models/AdminProfile";

declare global {
  namespace Express {
    // augment the Request interface
    interface Request {
      userId?: string;
      userRole?: UserRole;
      companyId?: string;
      userProfile?: IUserProfile;
      companyProfile?: ICompanyProfile;
      hrProfile?: IHRProfile;
      adminProfile?: IAdminProfile;
      hrId?: string;
    }
  }
}

// This is needed to make it a module
export {};
