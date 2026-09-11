import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy/50">
      <div className="container py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark text-navy">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span>ClassDirectory</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/directory" className="hover:text-foreground">Directory</Link>
            <Link to="/register" className="hover:text-foreground">Register</Link>
            <Link to="/student/login" className="hover:text-foreground">Student Login</Link>
            <Link to="/admin/login" className="hover:text-foreground">Admin Login</Link>
          </nav>
</div>
        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-muted-foreground">
          &#169; {new Date().getFullYear()} ClassDirectory. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
