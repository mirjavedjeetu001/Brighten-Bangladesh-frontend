export interface User {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  division?: string;
  district?: string;
  nid?: string;
  educationStatus?: string;
  organization?: string;
  designation?: string;
  highestEducation?: string;
  educationMajor?: string;
  areaOfInterest?: string;
  reasonToJoin?: string;
  profilePhoto?: string;  // TypeORM converts to camelCase in JSON
  role: 'super_admin' | 'admin' | 'content_manager' | 'editor' | 'member' | 'volunteer';
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: number;
  authorId: number;
  title: string;
  slug: string;
  coverImage?: string;
  summary?: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Magazine {
  id: number;
  title: string;
  issueNumber?: string;
  publishDate?: string;
  coverImage?: string;
  filePath?: string;
  createdAt: string;
}

export interface Membership {
  id: number;
  userId: number;
  membershipId?: string;
  status: 'inactive' | 'active' | 'expired';
  validFrom?: string;
  validTo?: string;
  criteria?: any;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface UserActivity {
  id: number;
  userId: number;
  type: string;
  meta?: any;
  createdAt: string;
}

export interface EligibilityResult {
  eligible: boolean;
  rules: {
    blogs: boolean;
    events: boolean;
    projects: boolean;
  };
  counts: {
    approvedBlogsLast30Days: number;
    eventParticipationsLast90Days: number;
    projectParticipationsLast180Days: number;
  };
  message: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization?: string;
  profilePhoto?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
