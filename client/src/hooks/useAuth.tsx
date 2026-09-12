import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Admin } from "@/types";
import { loginAdmin } from "@/services/auth.service";

interface AuthContextValue {
 admin: Admin | null;
 isAuthenticated: boolean;
 login: (email: string, password: string) => Promise<void>;
 logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAdmin(): Admin | null {
 try {
 const raw = localStorage.getItem("admin_info");
 return raw ? (JSON.parse(raw) as Admin) : null;
 } catch {
 return null;
 }
}

export function AuthProvider({ children }: { children: ReactNode }) {
 const [admin, setAdmin] = useState<Admin | null>(readStoredAdmin);

 const login = useCallback(async (email: string, password: string) => {
 const { token, admin: adminData } = await loginAdmin(email, password);
 localStorage.setItem("admin_token", token);
 localStorage.setItem("admin_info", JSON.stringify(adminData));
 setAdmin(adminData);
 }, []);

 const logout = useCallback(() => {
 localStorage.removeItem("admin_token");
 localStorage.removeItem("admin_info");
 setAdmin(null);
 }, []);

 return (
 <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
 return ctx;
}
