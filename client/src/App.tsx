import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { StudentAuthProvider } from "@/hooks/useStudentAuth";
import { Toaster } from "@/components/ui/toaster";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })));
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
 <div className="flex min-h-screen items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
 {/* Public site */}
 <Route element={<PublicLayout />}>
 <Route path="/" element={<Home />} />
 <Route path="/register" element={<Register />} />
 <Route path="/directory" element={<Directory />} />
 <Route path="/admin/login" element={<AdminLogin />} />
 <Route path="/student/login" element={<StudentLogin />} />
 <Route path="/student/profile" element={<StudentProfile />} />
 <Route path="/student/teams/directory" element={<TeamsDirectory />} />
          <Route path="/student/teams/create" element={<CreateTeam />} />
 <Route path="/student/teams/me" element={<MyTeam />} />
 <Route path="/student/teams/:teamId" element={<TeamWorkspace />} />
 <Route path="/student/invitations" element={<MyInvitations />} />
 </Route>

 {/* Admin (protected) */}
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
