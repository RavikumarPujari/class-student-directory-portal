import axios from "axios";

// In development, defaults to "/api" (proxied to localhost:5000 via Vite).
// In production, VITE_API_URL points to the Render backend (e.g. https://api.onrender.com).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Prefer the admin token; fall back to the student token for student auth routes.
  const token = localStorage.getItem("admin_token") || localStorage.getItem("student_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      localStorage.removeItem("student_token");
      localStorage.removeItem("student_info");
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const details = err.response?.data?.details;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((d: any) => d.message).join(", ");
    }
    return err.response?.data?.message || err.message || "Something went wrong";
  }
  return "Something went wrong";
}
