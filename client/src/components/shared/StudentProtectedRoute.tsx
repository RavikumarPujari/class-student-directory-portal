import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "@/hooks/useStudentAuth";

interface StudentProtectedRouteProps {
  children: ReactNode;
}

export function StudentProtectedRoute({ children }: StudentProtectedRouteProps) {
  const { isStudentAuthenticated } = useStudentAuth();
  const location = useLocation();

  if (!isStudentAuthenticated) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/student/login?redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
export default StudentProtectedRoute;

