import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  User,
  Users2,
  Mail,
  Settings,
  LogOut,
  Sparkles,
  ArrowRight,
  Globe,
  Users,
  LayoutDashboard
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { fetchStudents } from "@/services/students.service";
import { Student } from "@/types";
import { NotificationBell } from "./NotificationBell";

interface PortalHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export function PortalHeader({ onOpenMobileSidebar }: PortalHeaderProps) {
  const { student, isStudentAuthenticated, studentLogout } = useStudentAuth();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Profile dropdown state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchStudents({ search: searchQuery, limit: 5 });
        setSearchResults(res.data || []);
        setIsSearchOpen(true);
      } catch (err) {
        console.warn("Header search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "S";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md md:px-6 lg:px-8 shadow-xs">
      {/* Left: Mobile hamburger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              placeholder="Search students, teams, skills..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isSearching ? "Searching directory..." : `Found ${searchResults.length} matches`}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No students matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/directory?search=${encodeURIComponent(s.name)}`);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.usn} • {s.branch || "General"}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-0.5">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/directory?search=${encodeURIComponent(searchQuery)}`);
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View all results in Directory →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {isStudentAuthenticated ? (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 pr-2.5 hover:bg-slate-100/80 transition-colors focus:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  {student?.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(student?.name)}</span>
                  )}
                </div>
                <div className="hidden text-left md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {student?.name || "Student"}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 leading-none">
                    {student?.branch || "VTU CSE"}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{student?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{student?.email}</p>
                    <p className="text-[10px] font-mono text-indigo-600 mt-0.5">{student?.usn}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    Student Dashboard
                  </Link>

                  <Link
                    to="/directory"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Users className="h-4 w-4 text-slate-400" />
                    Student Directory
                  </Link>

                  <Link
                    to="/student/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>

                  <Link
                    to="/student/teams/me"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Users2 className="h-4 w-4 text-slate-400" />
                    My Teams
                  </Link>

                  <Link
                    to="/student/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <Link
                    to="/"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-slate-400" />
                    Public Home Page
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        studentLogout();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/student/login"
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
export default PortalHeader;
