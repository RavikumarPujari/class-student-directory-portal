import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { NotificationBell } from "./NotificationBell";

const links = [
 { to: "/", label: "Home" },
 { to: "/directory", label: "Directory" },
];

export function Navbar() {
 const [open, setOpen] = useState(false);
 const { isStudentAuthenticated, studentLogout } = useStudentAuth();

 return (
 <header className="sticky top-0 z-40 border-b border-border bg-navy/70 backdrop-blur-md">
 <div className="container flex h-16 items-center justify-between">
 <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-navy">
 <GraduationCap className="h-5 w-5" />
 </span>
 <span>ClassDirectory</span>
 </Link>

 <nav className="hidden items-center gap-1 lg:flex">
 {links.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 className={({ isActive }) =>
 `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
 isActive ? "text-gold bg-muted" : "text-muted-foreground hover:text-foreground"
 }`
 }
 >
 {link.label}
 </NavLink>
 ))}
 </nav>

 <div className="hidden items-center gap-3 flex-wrap lg:flex">
 {isStudentAuthenticated ? (
 <>
 <NotificationBell />
 <Button asChild variant="outline" size="sm">
 <Link to="/student/teams/directory">Teams</Link>
 </Button>
 <Button asChild variant="outline" size="sm">
 <Link to="/student/profile">My Profile</Link>
 </Button>
 <Button variant="ghost" size="sm" onClick={studentLogout}>
 Sign Out
 </Button>
 </>
 ) : (
 <>
 <Button asChild variant="outline" size="sm">
 <Link to="/student/login">Student Login</Link>
 </Button>
 <Button asChild size="sm">
 <Link to="/register">Get Started</Link>
 </Button>
 </>
 )}
 <Link to="/admin/login" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-2 opacity-70 hover:opacity-100 transition-opacity">
 <Shield className="h-3.5 w-3.5" />
 Admin
 </Link>
 </div>

 <div className="flex items-center gap-2 lg:hidden">
 {isStudentAuthenticated && <NotificationBell />}
 <button
 className="rounded-lg p-2 text-foreground"
 onClick={() => setOpen((o) => !o)}
 aria-label="Toggle menu"
 >
 {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
 </button>
 </div>
 </div>

 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden border-t border-border lg:hidden"
 >
 <div className="container flex flex-col gap-1 py-4">
 {links.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 onClick={() => setOpen(false)}
 className={({ isActive }) =>
 `rounded-lg px-4 py-3 text-sm font-medium ${
 isActive ? "text-gold bg-muted" : "text-muted-foreground"
 }`
 }
 >
 {link.label}
 </NavLink>
 ))}
 {isStudentAuthenticated ? (
 <>
 <Link
 to="/student/teams/directory"
 onClick={() => setOpen(false)}
 className="rounded-lg bg-teal/10 px-4 py-3 text-sm font-bold text-teal"
 >
 Teams Directory
 </Link>
 <Link
 to="/student/profile"
 onClick={() => setOpen(false)}
 className="rounded-lg bg-teal/10 px-4 py-3 text-sm font-bold text-teal"
 >
 My Profile
 </Link>
 <button
 onClick={() => {
 studentLogout();
 setOpen(false);
 }}
 className="rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground"
 >
 Sign Out
 </button>
 </>
 ) : (
 <>
 <Link
 to="/student/login"
 onClick={() => setOpen(false)}
 className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground"
 >
 Student Login
 </Link>
 <Link
 to="/register"
 onClick={() => setOpen(false)}
 className="rounded-lg px-4 py-3 text-sm font-medium text-gold"
 >
 Get Started
 </Link>
 </>
 )}
 <Link
 to="/admin/login"
 onClick={() => setOpen(false)}
 className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground flex items-center gap-2 mt-2 border-t border-border/50 pt-4"
 >
 <Shield className="h-4 w-4" />
 Admin Access
 </Link>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </header>
 );
}
