export type UserRole = 'Faculty' | 'HoD' | 'Director' | 'ProVC' | 'IQAC' | 'Admin';

export interface FacultyProfile {
  empId: string;
  name: string;
  email: string;
  phone: string;
  campus: 'bengaluru' | 'vizag' | 'hyderabad';
  department: string;
  designation: string;
  joiningDate: string;
  qualifications: {
    ug: string;
    pg: string;
    phd?: string;
  };
  externalIds: {
    orcid?: string;
    scopusId?: string;
    vidwanId?: string;
  };
  profileCompleteness: number;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface PrajnaScore {
  empId: string;
  total: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Fellow';
  breakdown: {
    teaching: number;
    research: number;
    fdp: number;
    achievements: number;
    admin: number;
    profile: number;
  };
  updatedAt: string;
}

export interface Publication {
  pubId: string;
  empId: string;
  doi: string;
  title: string;
  journal: string;
  year: number;
  authors: string[];
  indexing: 'SCI' | 'Scopus' | 'Other';
  status: 'pending' | 'approved' | 'rejected';
}

export interface Task {
  taskId: string;
  empId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  type: 'attendance' | 'fdp' | 'research' | 'other';
}
