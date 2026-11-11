import { api } from "./api";
import { ApiEnvelope, Student, StudentFormValues, StudentsResponse } from "@/types";

export interface StudentQueryParams {
 search?: string;
 section?: string;
 favoriteDomain?: string;
 sortBy?: string;
 order?: "asc" | "desc";
 page?: number;
 limit?: number;
}

export async function fetchStudents(params: StudentQueryParams): Promise<StudentsResponse> {
 const { data } = await api.get<StudentsResponse>("/students", { params });
 return data;
}

export async function checkEmailExists(email: string): Promise<boolean> {
 const { data } = await api.get<{ success: boolean; exists: boolean }>(`/students/check-email?email=${encodeURIComponent(email)}`);
 return data.exists;
}

export async function fetchStudentById(id: string): Promise<Student> {
 const { data } = await api.get<ApiEnvelope<Student>>(`/students/${id}`);
 return data.data;
}

export async function registerStudent(payload: StudentFormValues): Promise<Student> {
 const { data } = await api.post<ApiEnvelope<Student>>("/students", payload);
 return data.data;
}

export interface StudentLoginResponse {
 token: string;
}

export async function loginStudent(email: string, password: string): Promise<StudentLoginResponse> {
 const response = await api.post("/students/auth/login", {
 email,
 password,
 });

 return {
 token: response.data.token,
 };
}

export async function fetchMyStudentProfile(): Promise<Student> {
 const { data } = await api.get<ApiEnvelope<Student>>("/students/auth/me");
 return data.data;
}

export async function updateMyStudentProfile(payload: Partial<StudentFormValues>): Promise<Student> {
 const { data } = await api.put<ApiEnvelope<Student>>("/students/auth/me", payload);
 return data.data;
}

export async function deleteMyStudentProfile(): Promise<void> {
 await api.delete("/students/auth/me");
}

export async function updateStudent(id: string, payload: StudentFormValues): Promise<Student> {
 const { data } = await api.put<ApiEnvelope<Student>>(`/students/${id}`, payload);
 return data.data;
}

export async function deleteStudent(id: string): Promise<void> {
 await api.delete(`/students/${id}`);
}

export interface ClearAllResponse {
 count: number;
}

export async function clearAllStudents(): Promise<ClearAllResponse> {
 const { data } = await api.delete<ApiEnvelope<ClearAllResponse>>("/students/clear-all");
 return data.data;
}

export async function fetchFilterOptions(): Promise<{ sections: string[]; domains: string[] }> {
 const { data } = await api.get<ApiEnvelope<{ sections: string[]; domains: string[] }>>(
 "/students/meta/filters"
 );
 return data.data;
}

export function exportCsvUrl(): string {
 return "/api/students/export/csv";
}

export function exportExcelUrl(): string {
 return "/api/students/export/excel";
}

export async function downloadExport(format: "csv" | "excel"): Promise<void> {
 const token = localStorage.getItem("admin_token");
 const response = await api.get(`/students/export/${format}`, {
 responseType: "blob",
 headers: token ? { Authorization: `Bearer ${token}` } : {},
 });
 const blob = new Blob([response.data]);
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `students-${Date.now()}.${format === "csv" ? "csv" : "xlsx"}`;
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
}

export async function logoutStudent() { await api.post("/students/auth/logout"); }

// --- Gmail OTP Verification Endpoints ---

export async function sendRegistrationOtp(payload: { name: string; usn: string; email: string }): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>("/students/verification/send-otp", payload);
  return data;
}

export async function verifyRegistrationOtp(payload: { email: string; otp: string }): Promise<{ success: boolean; message: string; verifyToken: string }> {
  const { data } = await api.post<{ success: boolean; message: string; verifyToken: string }>("/students/verification/verify-otp", payload);
  return data;
}

export async function resendRegistrationOtp(payload: { email: string }): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>("/students/verification/resend-otp", payload);
  return data;
}

export async function sendProfileVerificationOtp(): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>("/students/verification/profile-send-otp");
  return data;
}

export async function verifyProfileOtp(otp: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>("/students/verification/profile-verify-otp", { otp });
  return data;
}
