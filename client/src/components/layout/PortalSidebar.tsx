import React from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
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
  LogIn,
  Globe
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService } from "@/services/teams.service";

interface PortalSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isHovered?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function PortalSidebar({
  mobileOpen = false,
  onCloseMobile,
  isHovered,
  onHoverChange
}: PortalSidebarProps) {
  const { isStudentAuthenticated, studentLogout } = useStudentAuth();
  const [pendingInvitesCount, setPendingInvitesCount] = React.useState<number>(0);
  const [internalHover, setInternalHover] = React.useState<boolean>(false);
  const leaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isExpandedDesktop = isHovered !== undefined ? isHovered : internalHover;

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

  React.useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setInternalHover(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setInternalHover(false);
      onHoverChange?.(false);
    }, 120);
  };

  const navItems = [
    {
      to: "/dashboard",
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
    navigate("/");
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (isExpanded: boolean, isMobileDrawer = false) => (
    <div className="flex h-full flex-col justify-between bg-gradient-to-b from-[#0b1329] via-[#0f1b38] to-[#1a1744] text-slate-300 overflow-hidden select-none">
      {/* Top Branding Section */}
      <div>
        <div className={`flex items-center pt-6 pb-5 transition-all duration-300 ${
          isExpanded ? "justify-between px-5" : "justify-center px-2"
        }`}>
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center group transition-transform ${
              isExpanded ? "gap-3" : "justify-center"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20 group-hover:scale-105 transition-transform shadow-xs">
              <GraduationCap className="h-6 w-6 text-amber-400 fill-amber-400/20" />
            </div>
            
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 pointer-events-none"
              }`}
            >
              <div className="font-display text-xl font-extrabold tracking-tight text-white leading-none whitespace-nowrap">
                ClassDirectory
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-1 whitespace-nowrap">
                Student Directory Portal
              </div>
            </div>
          </NavLink>

          {/* Close button on mobile drawer */}
          {isMobileDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`mt-2 space-y-1.5 transition-all duration-300 ${isExpanded ? "px-3" : "px-2"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.matchExact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <div key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`flex items-center rounded-xl transition-all duration-200 ${
                    isExpanded
                      ? "justify-between px-3.5 py-3"
                      : "justify-center h-11 w-11 mx-auto"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isExpanded ? "gap-3.5" : "justify-center"}`}>
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon
                        className={`h-5 w-5 transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                        }`}
                      />
                      {/* Compact dot badge in collapsed state */}
                      {!isExpanded && item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[#0b1329]" />
                        </span>
                      )}
                    </div>

                    {/* Navigation label (expanded) */}
                    <span
                      className={`whitespace-nowrap font-semibold text-sm transition-all duration-200 ${
                        isExpanded
                          ? "opacity-100 max-w-[160px] translate-x-0"
                          : "opacity-0 max-w-0 -translate-x-2 pointer-events-none overflow-hidden"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Counter badge (expanded) */}
                  {isExpanded && item.badge !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-sm shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>

                {/* Floating Tooltip in collapsed state */}
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl bg-slate-900/95 border border-slate-700/70 px-3 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-slate-900 border-l border-b border-slate-700/70" />
                    <div className="flex items-center gap-1.5 relative z-10">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 pb-1">
            <div className={`h-px bg-white/10 transition-all duration-300 ${isExpanded ? "mx-2" : "mx-1"}`} />
          </div>

          {/* Public Home Link */}
          <div className="relative group">
            <Link
              to="/"
              onClick={onCloseMobile}
              className={`flex items-center rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/[0.08] hover:text-white ${
                isExpanded
                  ? "gap-3.5 px-3.5 py-2.5 text-xs font-semibold"
                  : "justify-center h-11 w-11 mx-auto"
              }`}
            >
              <Globe className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  isExpanded
                    ? "opacity-100 max-w-[160px]"
                    : "opacity-0 max-w-0 pointer-events-none overflow-hidden"
                }`}
              >
                Public Home Page
              </span>
            </Link>

            {!isExpanded && (
              <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl bg-slate-900/95 border border-slate-700/70 px-3 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-slate-900 border-l border-b border-slate-700/70" />
                <span>Public Home Page</span>
              </div>
            )}
          </div>

          {/* Logout / Login button */}
          {isStudentAuthenticated ? (
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={`flex items-center rounded-xl transition-all duration-200 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 ${
                  isExpanded
                    ? "w-full gap-3.5 px-3.5 py-2.5 text-xs font-semibold"
                    : "justify-center h-11 w-11 mx-auto"
                }`}
              >
                <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100 max-w-[160px]"
                      : "opacity-0 max-w-0 pointer-events-none overflow-hidden"
                  }`}
                >
                  Logout
                </span>
              </button>

              {!isExpanded && (
                <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl bg-slate-900/95 border border-slate-700/70 px-3 py-1.5 text-xs font-semibold text-rose-300 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-slate-900 border-l border-b border-slate-700/70" />
                  <span>Logout</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative group">
              <NavLink
                to="/student/login"
                onClick={onCloseMobile}
                className={`flex items-center rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/[0.08] hover:text-white ${
                  isExpanded
                    ? "gap-3.5 px-3.5 py-2.5 text-xs font-semibold"
                    : "justify-center h-11 w-11 mx-auto"
                }`}
              >
                <LogIn className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100 max-w-[160px]"
                      : "opacity-0 max-w-0 pointer-events-none overflow-hidden"
                  }`}
                >
                  Sign In
                </span>
              </NavLink>

              {!isExpanded && (
                <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl bg-slate-900/95 border border-slate-700/70 px-3 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-slate-900 border-l border-b border-slate-700/70" />
                  <span>Sign In</span>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Watermark & Illustration Section */}
      <div className={`relative overflow-hidden pt-4 transition-all duration-300 text-center ${
        isExpanded ? "px-5 pb-6" : "px-2 pb-5"
      }`}>
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-purple-500/15 blur-xl" />

        <div className="relative flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-400/20 shadow-inner">
            <GraduationCap className="h-6 w-6 text-indigo-400/80" />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              isExpanded ? "opacity-100 max-h-16 mt-2.5" : "opacity-0 max-h-0 pointer-events-none"
            }`}
          >
            <div className="text-[10px] font-semibold tracking-wider text-indigo-200/90 uppercase whitespace-nowrap">
              Connect • Discover
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-indigo-200/70 uppercase whitespace-nowrap">
              Collaborate
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Auto-Collapsing Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-30 hidden lg:block shadow-xl shadow-slate-950/15 transition-[width] duration-300 ease-in-out ${
          isExpandedDesktop ? "w-64" : "w-20"
        }`}
      >
        {renderSidebarContent(isExpandedDesktop, false)}
      </aside>

      {/* Mobile Drawer Overlay (Click-to-open, Click-to-close) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true, true)}
          </aside>
        </div>
      )}
    </>
  );
}
export default PortalSidebar;
