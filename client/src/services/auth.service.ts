import { api } from "./api";
import { Admin, ApiEnvelope, DashboardStats } from "@/types";

export async function loginAdmin(email: string, password: string) {
 const { data } = await api.post<ApiEnvelope<{ token: string; admin: Admin }>>("/auth/login", {
 email,
 password,
 });
 return data.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
 const { data } = await api.get<ApiEnvelope<DashboardStats>>("/dashboard");
 return data.data;
}
