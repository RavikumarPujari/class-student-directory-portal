export interface Student {
  id: string;
  name: string;
  usn: string;
  section: string;
  branch: string;
  year: string;
  semester: number;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string | null;
  favoriteDomain: string;
  skills: string;
  bio: string | null;
  photo: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormValues {
  name: string;
  usn: string;
  section: string;
  branch: string;
  year: string;
  semester: number;
  phone: string;
  email: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  favoriteDomain: string;
  skills: string;
  bio?: string;
  photo?: string;
  password?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  pagination: Pagination;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalStudents: number;
  sectionWise: ChartDatum[];
  domainWise: ChartDatum[];
  recentRegistrations: Student[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
