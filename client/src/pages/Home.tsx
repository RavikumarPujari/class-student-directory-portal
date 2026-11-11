import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Search,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "One-Time Registration",
    description:
      "Students fill in their details once — name, USN, skills, links — and their profile is instantly part of the class directory.",
  },
  {
    icon: Search,
    title: "Instant Search & Filters",
    description:
      "Find classmates by name, USN, section, or favorite domain in real time. No scrolling through spreadsheets.",
  },
  {
    icon: Globe,
    title: "Showcase Your Work",
    description:
      "Every profile links out to LinkedIn, GitHub, and portfolio — turning the directory into a mini networking hub.",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    description:
      "Admins get a live dashboard with section-wise and domain-wise breakdowns, plus one-click CSV/Excel export.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "JWT-based admin auth, input sanitization, and rate limiting keep student data safe from tampering and abuse.",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description:
      "A polished, accessible UI with smooth motion — built to feel like a real product, not a class assignment.",
  },
];

const stats = [
  { label: "Fields Captured", value: "12+" },
  { label: "Admin Controls", value: "Full CRUD" },
  { label: "Export Formats", value: "CSV & Excel" },
  { label: "Setup Time", value: "< 5 min" },
];

export function Home() {
  return (
    <div className="bg-[#f3f6fb] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-slate-200/80">
        {/* Soft background ambient gradient */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Built for your classroom
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.15]">
              The Directory Every <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Class</span> Deserves
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed md:text-lg">
              Register once. Get discovered forever. A premium student directory where classmates
              connect, admins manage, and everyone's work gets seen.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all">
                <Link to="/register">
                  Register Now <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all">
                <Link to="/directory">Browse Directory</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-xs hover:shadow-md transition-all">
                <p className="font-display text-2xl font-extrabold text-indigo-600">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 border-b border-slate-200/80 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything a class directory <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">should be</span>
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Purpose-built for students and admins alike, with the details that actually matter.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Card className="h-full rounded-2xl border border-slate-200/90 bg-[#f8fafc]/50 hover:bg-white shadow-xs hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 shadow-2xs">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-24 border-b border-slate-200/80 bg-[#f3f6fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              About the <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Portal</span>
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              This portal was built to solve a simple problem: class contact lists live in scattered
              spreadsheets, chat groups, and forgotten forms. We centralized it — one clean profile
              per student, always up to date, always searchable.
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Admins get full control: search, edit, delete, and export data in one click, with live
              analytics on section and domain distribution across the class.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://vtu.ac.in"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-colors"
                aria-label="University Portal"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* Interactive Card Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xl shadow-sm">
                  R
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base font-display">Ravikumar Pujari</h3>
                  <p className="text-xs font-mono text-slate-500">2VX25CS001 • Section A</p>
                  <div className="flex gap-1.5 pt-1">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      CSE
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Full-Stack Web
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Passionate about building scalable distributed web applications, modern React portals, and cloud infrastructure.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">TypeScript</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">React</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">PostgreSQL</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Node.js</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified VTU Student
                </span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  View Profile <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 sm:p-12 md:p-16 text-center text-white shadow-xl shadow-indigo-950/15"
          >
            {/* Background watermark */}
            <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-10">
              <GraduationCap className="h-64 w-64 text-white" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">
                Ready to join the directory?
              </h2>
              <p className="mx-auto mt-4 text-sm sm:text-base text-indigo-100 leading-relaxed">
                It takes less than two minutes. Fill out your profile once — your classmates and
                collaborators find you forever.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-sm shadow-md transition-all">
                  <Link to="/register">
                    Register Your Profile <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all">
                  <Link to="/directory">
                    Explore Directory
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
export default Home;
