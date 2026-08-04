import { Link } from "react-router-dom";
import { GraduationCap, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy/50">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-navy">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>
              Class<span className="text-gradient-gold">Directory</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A premium, modern portal that helps a class stay connected — one student profile at a
            time. Register once, get discovered by classmates and collaborators.
          </p>
          <div className="mt-6 flex gap-3">
            {[Github, Linkedin, Mail].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:text-gold hover:border-gold/30"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Navigate
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
            <li><Link to="/directory" className="text-muted-foreground hover:text-foreground">Directory</Link></li>
            <li><Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Admin
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/admin/login" className="text-muted-foreground hover:text-foreground">Admin Login</Link></li>
            <li><Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Class Student Directory & Collaboration Portal. Built for
        learning, built to last.
      </div>
    </footer>
  );
}
