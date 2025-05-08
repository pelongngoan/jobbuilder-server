-- JobBuilder Database Schema
-- This SQL schema represents the MongoDB models in a relational format

-- Users table (from User.ts)
CREATE TABLE users (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'hr', 'company') NOT NULL DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    location VARCHAR(255) DEFAULT '',
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles (from UserProfile.ts)
CREATE TABLE user_profiles (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    headline VARCHAR(255) DEFAULT '',
    bio TEXT DEFAULT '',
    skills JSON DEFAULT '[]',
    education JSON DEFAULT '[]',
    experience JSON DEFAULT '[]',
    certifications JSON DEFAULT '[]',
    languages JSON DEFAULT '[]',
    projects JSON DEFAULT '[]',
    preferred_job_types JSON DEFAULT '[]',
    preferred_work_locations JSON DEFAULT '[]',
    job_search_status ENUM('active', 'passive', 'not_looking') DEFAULT 'not_looking',
    availability VARCHAR(255) DEFAULT '',
    salary_expectation VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin profiles (from AdminProfile.ts)
CREATE TABLE admin_profiles (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL UNIQUE,
    first_name VARCHAR(255) DEFAULT '',
    last_name VARCHAR(255) DEFAULT '',
    phone_number VARCHAR(50) DEFAULT '',
    admin_role ENUM('super_admin', 'content_manager', 'user_manager', 'support') NOT NULL DEFAULT 'user_manager',
    department VARCHAR(255) DEFAULT '',
    rights JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Companies (from Company.ts)
CREATE TABLE companies (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT '',
    industry VARCHAR(255) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    logo VARCHAR(255) DEFAULT '',
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+') DEFAULT '1-10',
    founding_year INT,
    company_values JSON DEFAULT '[]',
    social_media JSON DEFAULT '{}',
    benefits JSON DEFAULT '[]',
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Company profiles (from CompanyProfile.ts)
CREATE TABLE company_profiles (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    logo VARCHAR(255) DEFAULT '',
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+') DEFAULT '1-10',
    founding_year INT,
    mission_statement TEXT DEFAULT '',
    vision TEXT DEFAULT '',
    culture TEXT DEFAULT '',
    benefits JSON DEFAULT '[]',
    social_media JSON DEFAULT '{}',
    headquarters VARCHAR(255) DEFAULT '',
    offices JSON DEFAULT '[]',
    hr_members JSON DEFAULT '[]',
    job_posts JSON DEFAULT '[]',
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- HR accounts (from HR.ts)
CREATE TABLE hr (
    id VARCHAR(24) PRIMARY KEY,
    company_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL UNIQUE,
    department VARCHAR(255) DEFAULT '',
    position VARCHAR(255) DEFAULT '',
    permissions JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- HR profiles (from HRProfile.ts)
CREATE TABLE hr_profiles (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL UNIQUE,
    company_id VARCHAR(24) NOT NULL,
    position VARCHAR(255) DEFAULT '',
    department VARCHAR(255) DEFAULT '',
    bio TEXT DEFAULT '',
    permissions JSON DEFAULT '{}',
    job_posts JSON DEFAULT '[]',
    managed_applications JSON DEFAULT '[]',
    specializations JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE
);

-- Job categories (from JobCategory.ts)
CREATE TABLE job_categories (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_category VARCHAR(24),
    icon VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category) REFERENCES job_categories(id) ON DELETE SET NULL
);

-- Skills (from Skill.ts)
CREATE TABLE skills (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category ENUM('Technical', 'Soft Skills', 'Languages', 'Tools', 'Frameworks', 'Other') NOT NULL,
    description TEXT DEFAULT '',
    popularity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Jobs (from Job.ts)
CREATE TABLE jobs (
    id VARCHAR(24) PRIMARY KEY,
    company_id VARCHAR(24) NOT NULL,
    posted_by VARCHAR(24) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    requirements JSON DEFAULT '[]',
    responsibilities JSON DEFAULT '[]',
    skills JSON DEFAULT '[]',
    category VARCHAR(24),
    location VARCHAR(255) NOT NULL,
    type ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote') NOT NULL,
    experience_level ENUM('Entry', 'Mid', 'Senior', 'Executive') NOT NULL,
    salary JSON DEFAULT '{}',
    benefits JSON DEFAULT '[]',
    application_deadline TIMESTAMP,
    status ENUM('draft', 'pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    feedback TEXT DEFAULT '',
    views INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES job_categories(id) ON DELETE SET NULL
);

-- Job skills relation (many-to-many)
CREATE TABLE job_skills (
    job_id VARCHAR(24) NOT NULL,
    skill_id VARCHAR(24) NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Resumes (from Resume.ts)
CREATE TABLE resumes (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('generated', 'uploaded') NOT NULL,
    file_path VARCHAR(255),
    file_type VARCHAR(50),
    content JSON DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications (from Application.ts)
CREATE TABLE applications (
    id VARCHAR(24) PRIMARY KEY,
    job_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    resume_id VARCHAR(24),
    cover_letter TEXT DEFAULT '',
    answers JSON DEFAULT '[]',
    status ENUM('pending', 'reviewing', 'interview', 'rejected', 'accepted', 'withdrawn') DEFAULT 'pending',
    feedback TEXT DEFAULT '',
    interview_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- Saved jobs (from SavedJobs.ts)
CREATE TABLE saved_jobs (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    job_id VARCHAR(24) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Notifications (from Notification.ts)
CREATE TABLE notifications (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id VARCHAR(255),
    reference_model VARCHAR(255),
    action_url VARCHAR(255) DEFAULT '',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings (from Settings.ts)
CREATE TABLE settings (
    id VARCHAR(24) PRIMARY KEY,
    app_name VARCHAR(255) DEFAULT 'JobBuilder',
    allow_registration BOOLEAN DEFAULT TRUE,
    require_job_approval BOOLEAN DEFAULT TRUE,
    max_resume_size INT DEFAULT 5,
    support_email VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chats (from Chat.ts)
CREATE TABLE chats (
    id VARCHAR(24) PRIMARY KEY,
    participants JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chat messages (from ChatMessage.ts)
CREATE TABLE chat_messages (
    id VARCHAR(24) PRIMARY KEY,
    chat_id VARCHAR(24) NOT NULL,
    sender_id VARCHAR(24) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_hr_profiles_company_id ON hr_profiles(company_id);
CREATE FULLTEXT INDEX idx_jobs_search ON jobs(title, description);
CREATE FULLTEXT INDEX idx_company_profiles_search ON company_profiles(company_name, description); 