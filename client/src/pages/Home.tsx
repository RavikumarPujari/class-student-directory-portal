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
 "A polished dark, glassmorphic UI with smooth motion — built to feel like a real product, not a class assignment.",
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
 <div>
 {/* Hero */}
 <section className="relative overflow-hidden bg-grid-pattern bg-[size:32px_32px]">
 <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
 <div className="container relative py-24 md:py-32">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="mx-auto max-w-3xl text-center"
 >
 <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-semibold text-gold-light">
 <Sparkles className="h-3.5 w-3.5" /> Built for your classroom
 </span>
 <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
 The Directory Every <span className="text-gradient-gold">Class</span> Deserves
 </h1>
 <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
 Register once. Get discovered forever. A premium student directory where classmates
 connect, admins manage, and everyone's work gets seen.
 </p>
 <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button asChild size="lg">
 <Link to="/register">
 Register Now <ArrowRight className="h-4 w-4" />
 </Link>
 </Button>
 <Button asChild size="lg" variant="outline">
 <Link to="/directory">Browse Directory</Link>
 </Button>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
 >
 {stats.map((s) => (
 <div key={s.label} className="glass-card p-5 text-center">
 <p className="font-display text-2xl font-extrabold text-gradient-teal">{s.value}</p>
 <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
 </div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* Features */}
 <section className="border-t border-border py-24">
 <div className="container">
 <div className="mx-auto max-w-2xl text-center">
 <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
 Everything a class directory <span className="text-gradient-teal">should be</span>
 </h2>
 <p className="mt-4 text-muted-foreground">
 Purpose-built for students and admins alike, with the details that actually matter.
 </p>
 </div>

 <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {features.map((f, i) => (
 <motion.div
 key={f.title}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: i * 0.06 }}
 >
 <Card className="h-full transition-colors hover:border-border">
 <CardContent className="p-6">
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
 <f.icon className="h-5 w-5" />
 </div>
 <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
 <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* About */}
 <section className="border-t border-border py-24">
 <div className="container grid items-center gap-12 md:grid-cols-2">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 >
 <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
 About the <span className="text-gradient-gold">Portal</span>
 </h2>
 <p className="mt-5 text-muted-foreground">
 This portal was built to solve a simple problem: class contact lists live in scattered
 spreadsheets, chat groups, and forgotten forms. We centralized it — one clean profile
 per student, always up to date, always searchable.
 </p>
 <p className="mt-4 text-muted-foreground">
 Admins get full control: search, edit, delete, and export data in one click, with live
 analytics on section and domain distribution across the class.
 </p>
 <div className="mt-8 flex gap-4">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-teal">
 <Github className="h-4 w-4" />
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-gold">
 <Linkedin className="h-4 w-4" />
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
 <Globe className="h-4 w-4" />
 </div>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="relative"
 >
 <div className="glass-card animate-float p-8">
 <div className="flex items-center gap-4">
 <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold to-teal" />
 <div>
 <div className="h-3 w-32 rounded bg-muted" />
 <div className="mt-2 h-2 w-20 rounded bg-muted" />
 </div>
 </div>
 <div className="mt-6 space-y-2">
 <div className="h-2 w-full rounded bg-muted" />
 <div className="h-2 w-4/5 rounded bg-muted" />
 </div>
 <div className="mt-6 flex gap-2">
 <div className="h-8 flex-1 rounded-lg bg-muted" />
 <div className="h-8 flex-1 rounded-lg bg-muted" />
 <div className="h-8 flex-1 rounded-lg bg-muted" />
 </div>
 </div>
 </motion.div>
 </div>
 </section>

 {/* CTA */}
 <section className="border-t border-border py-24">
 <div className="container">
 <motion.div
 initial={{ opacity: 0, scale: 0.97 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 className="glass-card mx-auto max-w-3xl overflow-hidden p-10 text-center shadow-sm md:p-16"
 >
 <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
 Ready to join the directory?
 </h2>
 <p className="mx-auto mt-4 max-w-md text-muted-foreground">
 It takes less than two minutes. Fill out your profile once — your classmates and
 collaborators find you forever.
 </p>
 <Button asChild size="lg" className="mt-8">
 <Link to="/register">
 Register Your Profile <ArrowRight className="h-4 w-4" />
 </Link>
 </Button>
 </motion.div>
 </div>
 </section>
 </div>
 );
}
