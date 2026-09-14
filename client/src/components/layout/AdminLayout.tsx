import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
 LayoutDashboard,
 Users,
 LogOut,
 GraduationCap,
 Menu,
 X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItemsBase = [
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

 const navItems = admin?.role === 'government' 
   ? [{ to: '/government/dashboard', label: 'Dashboard', icon: LayoutDashboard }] 
   : navItemsBase;

 const SidebarContent = (
   <div className="flex h-full w-full flex-col items-center py-6 bg-navy/80 backdrop-blur-md border-r border-border/50">
     <Link to="/" onClick={() => setSidebarOpen(false)} className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-navy hover:scale-105 transition-transform" title="Home">
       <GraduationCap className="h-6 w-6" />
     </Link>

     <nav className="flex flex-col gap-4 flex-1 w-full px-3">
       {navItems.map((item) => (
         <NavLink
           key={item.to}
           to={item.to}
           onClick={() => setSidebarOpen(false)}
           title={item.label}
           className={({ isActive }) =>
             cn(
               "flex h-10 w-10 items-center justify-center rounded-xl mx-auto transition-all",
               isActive
                 ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                 : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
             )
           }
         >
           <item.icon className="h-5 w-5" />
         </NavLink>
       ))}
     </nav>

     <div className="flex flex-col items-center gap-4 mt-auto w-full px-3">
       <button
         onClick={handleLogout}
         title="Sign Out"
         className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
       >
         <LogOut className="h-5 w-5" />
       </button>
     </div>
   </div>
 );

 return (
   <div className="flex min-h-screen bg-background flex-col md:flex-row">
     {/* Desktop fixed sidebar */}
     <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col lg:flex">
       {SidebarContent}
     </aside>

     {/* Mobile top bar */}
     <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-navy/70 px-4 lg:hidden backdrop-blur-md">
       <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
         <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-navy">
           <GraduationCap className="h-5 w-5" />
         </span>
         <span>AdminPanel</span>
       </Link>
       
       <button
         className="rounded-lg p-2 text-foreground"
         onClick={() => setSidebarOpen(true)}
         aria-label="Open menu"
       >
         <Menu className="h-6 w-6" />
       </button>
     </header>

     {/* Mobile Slide-out Drawer */}
     <AnimatePresence>
       {sidebarOpen && (
         <div className="fixed inset-0 z-50 lg:hidden">
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             onClick={() => setSidebarOpen(false)}
           />
           <motion.aside
             initial={{ x: "-100%" }}
             animate={{ x: 0 }}
             exit={{ x: "-100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="absolute inset-y-0 left-0 w-16 shadow-2xl"
           >
             {SidebarContent}
           </motion.aside>
         </div>
       )}
     </AnimatePresence>

     <div className="flex-1 lg:pl-16 flex flex-col min-h-screen">
       <main className="flex-1 p-4 md:p-8">
         <Outlet />
       </main>
     </div>
   </div>
 );
}
