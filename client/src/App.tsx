import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { StudentAuthProvider } from "@/hooks/useStudentAuth";
import { Toaster } from "@/components/ui/toaster";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { StudentProtectedRoute } from "@/components/shared/StudentProtectedRoute";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.Settings })));
const Register = lazy(() => import("@/pages/Register").then(m => ({ default: m.Register })));
const Directory = lazy(() => import("@/pages/Directory").then(m => ({ default: m.Directory })));
const AdminLogin = lazy(() => import("@/pages/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const GovernmentDashboard = lazy(() => import("@/pages/GovernmentDashboard").then(m => ({ default: m.GovernmentDashboard })));
const AdminStudents = lazy(() => import("@/pages/AdminStudents").then(m => ({ default: m.AdminStudents })));
const StudentLogin = lazy(() => import("@/pages/StudentLogin").then(m => ({ default: m.StudentLogin })));
const StudentProfile = lazy(() => import("@/pages/StudentProfile").then(m => ({ default: m.StudentProfile })));
const CreateTeam = lazy(() => import("@/pages/CreateTeam").then(m => ({ default: m.CreateTeam })));
const MyTeam = lazy(() => import("@/pages/MyTeam").then(m => ({ default: m.MyTeam })));
const TeamWorkspace = lazy(() => import("@/pages/TeamWorkspace").then(m => ({ default: m.TeamWorkspace })));
const MyInvitations = lazy(() => import("@/pages/MyInvitations").then(m => ({ default: m.MyInvitations })));
const TeamsDirectory = lazy(() => import("@/pages/TeamsDirectory").then(m => ({ default: m.TeamsDirectory })));
const NotFound = lazy(() => import("@/pages/NotFound").then(m => ({ default: m.NotFound })));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6fb]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
        <span className="text-xs font-medium text-slate-500">Loading ClassDirectory...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Website & Authentication Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
              </Route>

              {/* Protected Student Portal Experience */}
              <Route
                element={
                  <StudentProtectedRoute>
                    <PortalLayout />
                  </StudentProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/teams/directory" element={<TeamsDirectory />} />
                <Route path="/student/teams/create" element={<CreateTeam />} />
                <Route path="/student/teams/me" element={<MyTeam />} />
                <Route path="/student/teams/:teamId" element={<TeamWorkspace />} />
                <Route path="/student/invitations" element={<MyInvitations />} />
                <Route path="/student/settings" element={<Settings />} />
              </Route>

              {/* Admin Portal (Protected for Admin) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/government/dashboard" element={<GovernmentDashboard />} />
                <Route path="/admin/students" element={<AdminStudents />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </StudentAuthProvider>
    </AuthProvider>
  );
}
