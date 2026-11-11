import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  Users2,
  Mail,
  Settings,
  LogOut,
  GraduationCap,
  X,
  LogIn
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService } from "@/services/teams.service";

interface PortalSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function PortalSidebar({ mobileOpen = false, onCloseMobile }: PortalSidebarProps) {
  const { student, isStudentAuthenticated, studentLogout } = useStudentAuth();
  const [pendingInvitesCount, setPendingInvitesCount] = React.useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (isStudentAuthenticated) {
      teamsService.getMyInvitations()
        .then((invites) => {
          if (Array.isArray(invites)) {
            const pending = invites.filter((inv: any) => inv.status === "PENDING");
            setPendingInvitesCount(pending.length);
          }
        })
        .catch(() => {});
    }
  }, [isStudentAuthenticated, location.pathname]);

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      to: "/directory",
      label: "Student Directory",
      icon: Users,
    },
    {
      to: "/student/profile",
      label: "My Profile",
      icon: User,
    },
    {
      to: "/student/teams/me",
      label: "My Teams",
      icon: Users2,
    },
    {
      to: "/student/invitations",
      label: "Invitations",
      icon: Mail,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined,
    },
    {
      to: "/student/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    studentLogout();
    navigate("/student/login");
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-gradient-to-b from-[#0b1329] via-[#0f1b38] to-[#1a1744] text-slate-300">
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group transition-transform"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <div className="font-display text-xl font-extrabold tracking-tight text-white leading-none">
                ClassDirectory
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">
                Student Directory Portal
              </div>
            </div>
          </NavLink>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 px-4 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.matchExact
                ? location.pathname === "/" || location.pathname === "/dashboard"
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Logout / Login button */}
          {isStudentAuthenticated ? (
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink
              to="/student/login"
              onClick={onCloseMobile}
              className="group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <LogIn className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span>Sign In</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Bottom Watermark & Illustration Section */}
      <div className="relative overflow-hidden px-6 pb-8 pt-6">
        {/* Subtle curved background overlay */}
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-purple-500/15 blur-xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-400/20 shadow-inner">
            <GraduationCap className="h-8 w-8 text-indigo-400/80" />
          </div>
          <div className="text-xs font-semibold tracking-wider text-indigo-200/90 uppercase">
            Connect • Discover
          </div>
          <div className="text-xs font-semibold tracking-wider text-indigo-200/70 uppercase">
            Collaborate
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block shadow-xl shadow-slate-950/10">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

