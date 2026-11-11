import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/70 bg-white/60 py-4 px-6 md:px-8 text-xs text-slate-500 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 font-display font-bold text-slate-800">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span>ClassDirectory</span>
        </div>

        {/* Center: Copyright & Attribution */}
        <div className="text-slate-500 font-medium">
          © {new Date().getFullYear()} ClassDirectory. Built with ❤️ for VTU Students
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            About
          </Link>
          <span className="text-slate-300">|</span>
          <a
            href="mailto:support@classportal.com"
            className="hover:text-indigo-600 transition-colors"
          >
            Help
          </a>
          <span className="text-slate-300">|</span>
          <Link to="/directory" className="hover:text-indigo-600 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
