import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
 LayoutDashboard,
 Users,
 LogOut,
 GraduationCap,
 Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const navItems = [
 { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
 { to: "/admin/students", label: "Students", icon: Users },
];

export function AdminLayout() {
 const { admin, logout } = useAuth();
 const navigate = useNavigate();
 const { toast } = useToast();
 const [sidebarOpen, setSidebarOpen] = useState(false);

 function handleLogout() {
 logout();
 toast({ title: "Logged out", description: "See you next time!", variant: "default" });
 navigate("/admin/login");
 }

 const SidebarContent = (
 <div className="flex h-full flex-col">
 <div className="flex items-center gap-2 px-6 py-6 font-display text-lg font-bold">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-navy">
 <GraduationCap className="h-5 w-5" />
 </span>
 Admin<span className="text-gradient-gold">Panel</span>
 </div>

 <nav className="flex-1 space-y-1 px-3">
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 onClick={() => setSidebarOpen(false)}
 className={({ isActive }) =>
 cn(
 "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
 isActive
 ? "bg-gold/10 text-gold border border-gold/20"
 : "text-muted-foreground hover:bg-muted hover:text-foreground"
 )
 }
 >
 <item.icon className="h-4 w-4" />
 {item.label}
 </NavLink>
 ))}
 </nav>

 <div className="border-t border-border p-4">
 <div className="mb-3 flex items-center gap-3 rounded-xl bg-card px-3 py-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-gold/20 font-display text-sm font-bold text-teal-light">
 {admin?.name?.charAt(0) || "A"}
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-medium">{admin?.name || "Administrator"}</p>
 <p className="truncate text-xs text-muted-foreground">{admin?.email}</p>
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
 >
 <LogOut className="h-4 w-4" />
 Logout
 </button>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen bg-background">
 {/* Desktop sidebar */}
 <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-navy-light/60 lg:block">
 {SidebarContent}
 </aside>

 {/* Mobile sidebar */}
 {sidebarOpen && (
 <div className="fixed inset-0 z-50 lg:hidden">
 <div className="absolute inset-0 bg-card" onClick={() => setSidebarOpen(false)} />
 <aside className="absolute inset-y-0 left-0 w-64 bg-navy-light border-r border-border">
 {SidebarContent}
 </aside>
 </div>
 )}

 <div className="lg:pl-64">
 <header className="flex h-16 items-center justify-between border-b border-border bg-navy/70 px-4 lg:hidden">
 <span className="font-display font-bold">AdminPanel</span>
 <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2">
 <Menu className="h-6 w-6" />
 </button>
 </header>
 <main className="p-4 md:p-8">
 <Outlet />
 </main>
 </div>
 </div>
 );
}
