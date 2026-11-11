import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  User,
  Users2,
  Mail,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { NotificationBell } from "./NotificationBell";
import { fetchStudents } from "@/services/students.service";
import { Student } from "@/types";

interface PortalHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function PortalHeader({ onOpenMobileSidebar }: PortalHeaderProps) {
  const { student, isStudentAuthenticated, studentLogout } = useStudentAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchStudents({ search: searchQuery.trim(), limit: 5 });
        setSearchResults(res.data);
        setIsSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "S";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                placeholder="Search students, teams..."
                className="h-10 w-full rounded-xl border border-slate-200/90 bg-[#f1f5f9] pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </form>

          {/* Instant Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Matching Students
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500">
                  {isSearching ? "Searching directory..." : "No matching students found."}
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
                    getInitials(student?.name)
                  )}
                </div>
                <span className="hidden text-sm font-semibold text-slate-800 md:inline">
                  {student?.name || "Student"}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-slate-100 px-3 py-2.5 mb-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {student?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {student?.email}
                    </div>
                    {student?.usn && (
                      <div className="mt-1 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                        {student.usn}
                      </div>
                    )}
                  </div>

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
                    to="/student/invitations"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    Invitations
                  </Link>

                  <Link
                    to="/student/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        studentLogout();
                        navigate("/student/login");
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
              className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
