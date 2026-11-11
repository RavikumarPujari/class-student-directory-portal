import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Users2,
  Mail,
  CheckCircle2,
  ArrowRight,
  Search,
  Code2,
  Clock,
  Zap,
  PlusCircle,
  UserPlus,
  UserCheck,
  Settings,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { fetchStudents } from "@/services/students.service";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { notificationsService, Notification } from "@/services/notifications.service";
import { Student } from "@/types";
import { formatDistanceToNow } from "date-fns";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-600",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export function Dashboard() {
  const { student, isStudentAuthenticated } = useStudentAuth();
  const navigate = useNavigate();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [activeTeams, setActiveTeams] = useState<PopulatedTeam[]>([]);
  const [myTeams, setMyTeams] = useState<PopulatedTeam[]>([]);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [directorySearch, setDirectorySearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Load real backend data
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch Students
        try {
          const studentsRes = await fetchStudents({ limit: 10, page: 1 });
          if (isMounted) {
            setStudents(studentsRes.data || []);
            setTotalStudentsCount(studentsRes.pagination?.total || (studentsRes.data ? studentsRes.data.length : 0));
          }
        } catch (e) {
          console.warn("Could not load students directory list", e);
        }

        // 2. Fetch Teams
        try {
          const allTeams = await teamsService.getAllTeams();
          if (isMounted) {
            setActiveTeams(allTeams || []);
          }
        } catch (e) {
          console.warn("Could not load all teams", e);
        }

        // 3. Authenticated student data
        if (isStudentAuthenticated) {
          try {
            const [userTeams, userInvites, userNotifications] = await Promise.all([
              teamsService.getMyTeams().catch(() => []),
              teamsService.getMyInvitations().catch(() => []),
              notificationsService.getNotifications(5).catch(() => []),
            ]);

            if (isMounted) {
              setMyTeams(userTeams || []);
              const pending = (userInvites || []).filter((inv: any) => inv.status === "PENDING");
              setPendingInvitationsCount(pending.length);
              setRecentNotifications(userNotifications || []);
            }
          } catch (e) {
            console.warn("Could not load authenticated student data", e);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isStudentAuthenticated]);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (!student) return 0;
    const fields = [
      student.name,
      student.usn,
      student.email,
      student.branch,
      student.year,
      student.semester,
      student.skills,
      student.bio,
      student.phone,
      student.linkedin,
      student.github,
      student.portfolio,
      student.favoriteDomain,
      student.isEmailVerified,
    ];
    const filled = fields.filter((f) => Boolean(f) && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [student]);

  // Filtered student list for directory card
  const filteredStudents = useMemo(() => {
    if (!directorySearch.trim()) return students.slice(0, 4);
    const q = directorySearch.toLowerCase();
    return students
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.usn?.toLowerCase().includes(q) ||
          s.branch?.toLowerCase().includes(q) ||
          s.skills?.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [students, directorySearch]);

  // Featured team for "Your Teams" card
  const primaryTeam = useMemo(() => {
    if (myTeams && myTeams.length > 0) return myTeams[0];
    if (activeTeams && activeTeams.length > 0) return activeTeams[0];
    return null;
  }, [myTeams, activeTeams]);

  // Student initials helper
  const getInitials = (name?: string) => {
    if (!name) return "S";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 1).toUpperCase();
  };

  const getStudentFirstName = () => {
    if (!student?.name) return "Student";
    return student.name.trim().split(" ")[0];
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. WELCOME BANNER                                        */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f46e5] p-6 sm:p-8 text-white shadow-md">
        {/* Semi-transparent graduation cap background watermark */}
        <div className="pointer-events-none absolute -bottom-8 left-4 opacity-15 select-none">
          <GraduationCap className="h-44 w-44 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              Welcome back, {getStudentFirstName()}! <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base font-normal text-blue-100/90 leading-relaxed">
              Explore, connect and collaborate with your class community
            </p>
          </div>

          {/* Right Campus Building Photo Badge */}
          <div className="relative hidden md:block w-72 lg:w-96 h-28 overflow-hidden rounded-xl shadow-lg border border-white/20">
            <img
              src="/campus-banner.png"
              alt="VTU Campus"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // Fallback graceful banner if image asset path fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Campus details badge */}
            <div className="absolute bottom-2.5 right-2.5 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10 shadow-sm">
              VTU Belagavi • {student?.branch ? `B.Tech ${student.branch}` : "B.Tech CSE"}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. STATISTIC CARDS (4 COLUMNS)                          */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-[#f0f7ff] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">
                {totalStudentsCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1.5">
                Total Students
              </div>
            </div>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" /> 12%
          </span>
        </div>

        {/* Card 2: Active Teams */}
        <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">
                {activeTeams.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1.5">
                Active Teams
              </div>
            </div>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" /> 2%
          </span>
        </div>

        {/* Card 3: Pending Invitations */}
        <Link
          to="/student/invitations"
          className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-[#faf5ff] p-5 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-inner">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">
                {pendingInvitationsCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1.5">
                Pending Invitations
              </div>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200/50 text-purple-700 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Card 4: Profile Complete */}
        <Link
          to="/student/profile"
          className="flex items-center justify-between rounded-2xl border border-teal-100 bg-[#f0fdf9] p-5 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shadow-inner">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">
                {isStudentAuthenticated ? `${profileCompletion}%` : "100%"}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1.5">
                Profile Complete
              </div>
            </div>
          </div>
          <div className="text-xl select-none">
            🎉
          </div>
        </Link>
      </section>

      {/* ======================================================== */}
      {/* 3. TWO-COLUMN MAIN CONTENT SECTION                       */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ====================================================== */}
        {/* LEFT COLUMN: Student Directory & Quick Actions (7 cols) */}
        {/* ====================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Student Directory */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Student Directory
                </h2>
              </div>
              <Link
                to="/directory"
                className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* In-Card Search Field */}
            <div className="relative mt-4 mb-4">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search by name, USN or branch..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Student List Rows */}
            {filteredStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {students.length === 0
                    ? "No student profiles found in directory yet."
                    : "No students matching your search criteria."}
                </p>
                <Link
                  to="/register"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Register a Student Account
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((item, idx) => {
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${avatarColor}`}
                        >
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(item.name)
                          )}
                        </div>

                        {/* Name & USN */}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-medium text-slate-500">
                            {item.usn} {item.branch ? `• ${item.branch}` : ""}
                          </div>
                        </div>
                      </div>

                      {/* Right: Branch Badge & Action */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {item.branch && (
                          <span className="hidden sm:inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-blue-100">
                            {item.branch}
                          </span>
                        )}
                        <Link
                          to={`/directory?search=${encodeURIComponent(item.name)}`}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Quick Actions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
              {/* Tile 1: Create Team */}
              <button
                onClick={() => navigate("/student/teams/create")}
                className="group flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-[#f0f7ff] p-4 text-center hover:bg-blue-100/70 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <UserPlus className="h-5 w-5" />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  Create Team
                </span>
              </button>

              {/* Tile 2: Join Team */}
              <button
                onClick={() => navigate("/student/teams/directory")}
                className="group flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-[#eef2ff] p-4 text-center hover:bg-indigo-100/70 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  Join Team
                </span>
              </button>

              {/* Tile 3: Explore Students */}
              <button
                onClick={() => navigate("/directory")}
                className="group flex flex-col items-center justify-center rounded-2xl border border-purple-100 bg-[#faf5ff] p-4 text-center hover:bg-purple-100/70 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  Explore Students
                </span>
              </button>

              {/* Tile 4: Update Profile */}
              <button
                onClick={() => navigate("/student/profile")}
                className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-4 text-center hover:bg-emerald-100/70 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Settings className="h-5 w-5" />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  Update Profile
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: Your Teams & Recent Activity (5 cols)    */}
        {/* ====================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Your Teams */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users2 className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Your Teams
                </h2>
              </div>
              <Link
                to="/student/teams/me"
                className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {primaryTeam ? (
              <div className="mt-4 rounded-2xl border border-indigo-100/90 bg-gradient-to-b from-[#f8faff] to-[#eef2ff] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {primaryTeam.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {primaryTeam.memberCount || primaryTeam.members?.length || 1} Members •{" "}
                        {primaryTeam.requiredSkills?.split(",")[0] || "CSE Project"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Member Avatar Row */}
                <div className="mt-4 flex items-center justify-center gap-1.5 py-1">
                  {["R", "S", "P", "A"].map((init, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-sm ${
                        AVATAR_COLORS[i % AVATAR_COLORS.length]
                      }`}
                    >
                      {init}
                    </div>
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 ring-2 ring-white shadow-sm">
                    +1
                  </div>
                </div>

                {/* Team Tagline */}
                <p className="mt-2 text-center text-xs font-medium italic text-slate-500">
                  {primaryTeam.description || "Innovate • Build • Grow Together"}
                </p>

                {/* Open Team CTA */}
                <button
                  onClick={() => navigate(`/student/teams/${primaryTeam.id}`)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-indigo-800 transition-all"
                >
                  Open Team <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <Users2 className="mx-auto h-8 w-8 text-slate-300" />
                <h4 className="mt-2 text-xs sm:text-sm font-bold text-slate-700">
                  No Active Team Found
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Collaborate with classmates by creating or joining a team.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate("/student/teams/create")}
                    className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Create Team
                  </button>
                  <button
                    onClick={() => navigate("/student/teams/directory")}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Browse Teams
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card: Recent Activity */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent Activity
                </h2>
              </div>
              <Link
                to="/student/invitations"
                className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Timeline */}
            <div className="mt-4 space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif, index) => {
                  const dotColors = [
                    "bg-blue-500",
                    "bg-amber-500",
                    "bg-emerald-500",
                    "bg-purple-500",
                  ];
                  const dotColor = dotColors[index % dotColors.length];

                  return (
                    <div
                      key={notif.id}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                        />
                        <div className="min-w-0 font-medium text-slate-700">
                          <span className="font-semibold text-slate-900 block truncate">
                            {notif.title}
                          </span>
                          <span className="text-slate-500 truncate block">
                            {notif.message}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  );
                })
              ) : (
                /* Fallback Timeline matching visual reference structure */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-semibold text-slate-800">
                        {primaryTeam ? `You joined ${primaryTeam.name} team` : "Explored Student Directory"}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      2 hours ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-slate-800">
                        {pendingInvitationsCount > 0
                          ? `${pendingInvitationsCount} pending team invitation${pendingInvitationsCount > 1 ? "s" : ""}`
                          : "Class directory profile synchronized"}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      3 hours ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-800">
                        Profile updated successfully
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      1 day ago
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

