import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Student } from "@/types";
import { loginStudent, fetchMyStudentProfile, logoutStudent } from "@/services/students.service";

interface StudentAuthContextValue {
 student: Student | null;
 isStudentAuthenticated: boolean;
 studentLogin: (email: string, password: string) => Promise<void>;
 studentLogout: () => void;
 refreshStudentProfile: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextValue | undefined>(undefined);

function readStoredStudent(): Student | null {
 try {
 const raw = localStorage.getItem("student_info");
 return raw ? (JSON.parse(raw) as Student) : null;
 } catch {
 return null;
 }
}

export function StudentAuthProvider({ children }: { children: ReactNode }) {
 const [student, setStudent] = useState<Student | null>(readStoredStudent);

 const studentLogin = useCallback(async (email: string, password: string) => {
 const { token } = await loginStudent(email, password);
 localStorage.setItem("student_token", token);
 // Fetch the full profile so we have it immediately after login.
 const profile = await fetchMyStudentProfile();
 localStorage.setItem("student_info", JSON.stringify(profile));
 setStudent(profile);
 }, []);

 const studentLogout = useCallback(() => {
 localStorage.removeItem("student_token");
 localStorage.removeItem("student_info");
    logoutStudent().catch(() => {});
 setStudent(null);
 }, []);

 const refreshStudentProfile = useCallback(async () => {
 const profile = await fetchMyStudentProfile();
 localStorage.setItem("student_info", JSON.stringify(profile));
 setStudent(profile);
 }, []);

 return (
 <StudentAuthContext.Provider
 value={{
 student,
 isStudentAuthenticated: !!student,
 studentLogin,
 studentLogout,
 refreshStudentProfile,
 }}
 >
 {children}
 </StudentAuthContext.Provider>
 );
}

export function useStudentAuth() {
 const ctx = useContext(StudentAuthContext);
 if (!ctx) throw new Error("useStudentAuth must be used within a StudentAuthProvider");
 return ctx;
}
