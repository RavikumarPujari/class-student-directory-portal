import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#0b1329] text-slate-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-[#0b1329] shadow-md shadow-amber-500/20">
              <GraduationCap className="h-4 w-4 fill-current" />
            </span>
            <span className="tracking-tight">ClassDirectory</span>
          </Link>

          {/* Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link to="/directory" className="text-slate-400 hover:text-white transition-colors">Student Directory</Link>
            <Link to="/register" className="text-slate-400 hover:text-white transition-colors">Register</Link>
            <Link to="/student/login" className="text-slate-400 hover:text-white transition-colors">Student Login</Link>
            <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">Admin Portal</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} ClassDirectory. Built with ❤️ for VTU Students.</p>
          <p>Secure Student Collaboration & Directory Platform</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
