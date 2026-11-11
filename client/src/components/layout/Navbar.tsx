import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, Shield, LayoutDashboard, User, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isStudentAuthenticated, student, studentLogout } = useStudentAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    studentLogout();
    navigate("/");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b1329]/95 backdrop-blur-md text-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-[#0b1329] shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 fill-current" />
          </span>
          <div className="flex flex-col">
            <span className="tracking-tight text-white font-bold leading-none">ClassDirectory</span>
            <span className="text-[10px] text-slate-400 font-normal tracking-wide">Student Directory Portal</span>
          </div>
        </Link>

        {/* Desktop Primary Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/directory"
            className={({ isActive }) =>
              `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Student Directory
          </NavLink>
          {isStudentAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-2.5 md:flex">
          {isStudentAuthenticated ? (
            <>
              <NotificationBell />
              <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-3.5 shadow-xs">
                <Link to="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  My Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-700 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold h-9 px-3.5">
                <Link to="/student/profile" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {student?.name?.split(" ")[0] || "Profile"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium h-9 px-2.5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-700 bg-transparent hover:bg-white/5 text-slate-200 text-xs font-semibold h-9 px-3.5">
                <Link to="/student/login">Student Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 shadow-sm">
                <Link to="/register" className="flex items-center gap-1">
                  Get Started <ArrowRight className="h-3 w-3 ml-0.5" />
                </Link>
              </Button>
            </>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <Link
            to="/admin/login"
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Admin Portal"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isStudentAuthenticated && <NotificationBell />}
          <button
            className="rounded-xl p-2 text-slate-200 hover:bg-white/10 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800 bg-[#0b1329] md:hidden px-4 py-4 space-y-1.5"
          >
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/directory"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              Student Directory
            </NavLink>

            {isStudentAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/student/profile"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/student/teams/me"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  My Teams
                </NavLink>
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <Link
                  to="/student/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Portal Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Navbar;
