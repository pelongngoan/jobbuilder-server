// Import all models to ensure they are registered with MongoDB
import { Application } from "./Application";
import { Chat } from "./Chat";
import { ChatMessage } from "./ChatMessage";
import { CompanyProfile } from "./CompanyProfile";
import { Job } from "./Job";
import { JobCategory } from "./JobCategory";
import { Notification } from "./Notification";
import { Resume } from "./Resume";
import { SavedJob } from "./SavedJobs";
import { User } from "./User";
import { UserProfile } from "./UserProfile";
import { Profile } from "./Profile";
import { StaffProfile } from "./StaffProfile";

// Export all models and types
export {
  Application,
  Chat,
  ChatMessage,
  CompanyProfile,
  Job,
  JobCategory,
  Notification,
  Resume,
  SavedJob,
  User,
  UserProfile,
  Profile,
  StaffProfile,
};
