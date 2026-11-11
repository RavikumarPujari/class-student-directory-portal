import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
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

  // Background token verification to keep profile up to date and validate session on refresh
  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (token) {
      fetchMyStudentProfile()
        .then((profile) => {
          localStorage.setItem("student_info", JSON.stringify(profile));
          setStudent(profile);
        })
        .catch((err) => {
          if (err?.response?.status === 401 || err?.status === 401) {
            localStorage.removeItem("student_token");
            localStorage.removeItem("student_info");
            setStudent(null);
          }
        });
    }
  }, []);

  const studentLogin = useCallback(async (email: string, password: string) => {
    const { token } = await loginStudent(email, password);
    localStorage.setItem("student_token", token);
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

  const isStudentAuthenticated = Boolean(student || localStorage.getItem("student_token"));

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isStudentAuthenticated,
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
