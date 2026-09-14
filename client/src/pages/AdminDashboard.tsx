import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Layers, Clock, Download, FileSpreadsheet } from "lucide-react";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchDashboardStats } from "@/services/auth.service";
import { downloadExport } from "@/services/students.service";
import { useToast } from "@/hooks/useToast";
import { DashboardStats } from "@/types";
import { TeamApprovalsTab } from "@/components/admin/TeamApprovalsTab";

const COLORS = ["#D4AF37", "#2DD4BF", "#E8C965", "#5EEAD4", "#B8952E", "#0F766E"];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "approvals">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
 const [now, setNow] = useState<Date>(() => new Date());
 const { toast } = useToast();

 // Live local clock — updates every second.
 useEffect(() => {
 const timer = setInterval(() => setNow(new Date()), 1000);
 return () => clearInterval(timer);
 }, []);

 useEffect(() => {
 fetchDashboardStats()
 .then(setStats)
 .catch(() =>
 toast({ title: "Failed to load dashboard", description: "Please try again.", variant: "destructive" })
 )
 .finally(() => setLoading(false));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 async function handleExport(format: "csv" | "excel") {
 setExporting(format);
 try {
 await downloadExport(format);
 toast({ title: "Export ready", description: `Downloaded students.${format === "csv" ? "csv" : "xlsx"}`, variant: "success" });
 } catch {
 toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
 } finally {
 setExporting(null);
 }
 }

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <Skeleton key={i} className="h-28" />
 ))}
 </div>
 <div className="grid gap-6 lg:grid-cols-2">
 <Skeleton className="h-80" />
 <Skeleton className="h-80" />
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
 >
<div>
 <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Dashboard</h1>
 <p className="mt-1 text-sm text-muted-foreground">Live overview of your class directory</p>
 <p className="mt-1 text-xs text-muted-foreground">
 {now.toLocaleDateString("en-US", {
 weekday: "long",
 day: "2-digit",
 month: "long",
 year: "numeric",
 })}{" "}
 / {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
 </p>
 </div>
 <div className="flex gap-3">
 <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting !== null}>
 <Download className="h-3.5 w-3.5" /> {exporting === "csv" ? "Exporting..." : "Export CSV"}
 </Button>
 <Button variant="teal" size="sm" onClick={() => handleExport("excel")} disabled={exporting !== null}>
 <FileSpreadsheet className="h-3.5 w-3.5" /> {exporting === "excel" ? "Exporting..." : "Export Excel"}
 </Button>
 </div>
 </motion.div>

 <div className="flex gap-4 border-b border-border pb-2">
 <Button variant={activeTab === "overview" ? "default" : "ghost"} onClick={() => setActiveTab("overview")}>Overview</Button>
 <Button variant={activeTab === "approvals" ? "default" : "ghost"} onClick={() => setActiveTab("approvals")}>Team Approvals</Button>
 </div>

 {activeTab === "approvals" ? <TeamApprovalsTab /> : (
 <>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon={Users} accent="gold" index={0} />
 <StatCard
 label="Sections Active"
 value={stats?.sectionWise.length ?? 0}
 icon={Layers}
 accent="teal"
 index={1}
 />
 <StatCard
 label="Domains Represented"
 value={stats?.domainWise.length ?? 0}
 icon={TrendingUp}
 accent="gold"
 index={2}
 />
 <StatCard
 label="Recent Signups"
 value={stats?.recentRegistrations.length ?? 0}
 icon={Clock}
 accent="teal"
 index={3}
 />
 </div>

 <div className="grid gap-6 lg:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle>Section-wise Distribution</CardTitle>
 <CardDescription>Number of students registered per section</CardDescription>
 </CardHeader>
 <CardContent>
 {stats && stats.sectionWise.length > 0 ? (
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={stats.sectionWise}>
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
 <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
 <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
 <Tooltip
 contentStyle={{
 background: "#131C31",
 border: "1px solid rgba(255,255,255,0.1)",
 borderRadius: "12px",
 fontSize: "12px",
 }}
 />
 <Bar dataKey="value" fill="#D4AF37" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Domain-wise Distribution</CardTitle>
 <CardDescription>Favorite domains across the class</CardDescription>
 </CardHeader>
 <CardContent>
 {stats && stats.domainWise.length > 0 ? (
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie
 data={stats.domainWise}
 dataKey="value"
 nameKey="name"
 innerRadius={55}
 outerRadius={90}
 paddingAngle={3}
 >
 {stats.domainWise.map((_, i) => (
 <Cell key={i} fill={COLORS[i % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 background: "#131C31",
 border: "1px solid rgba(255,255,255,0.1)",
 borderRadius: "12px",
 fontSize: "12px",
 }}
 />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>
 )}
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Recent Registrations</CardTitle>
 <CardDescription>The last 5 students to join the directory</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {stats && stats.recentRegistrations.length > 0 ? (
 stats.recentRegistrations.map((s) => (
 <div
 key={s.id}
 className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
 >
 <div className="flex items-center gap-3">
 <Avatar className="h-10 w-10">
 <AvatarImage src={s.photo || undefined} alt={s.name} />
 <AvatarFallback>{s.name.charAt(0).toUpperCase()}</AvatarFallback>
 </Avatar>
<div>
 <p className="text-sm font-medium">{s.name}</p>
 <p className="text-xs text-muted-foreground">
 {s.usn} • Section {s.section} • {s.branch} • {s.year} Year • Sem {s.semester}
 </p>
 </div>
 </div>
 <span className="text-xs text-muted-foreground">
 {new Date(s.createdAt).toLocaleDateString()}
 </span>
 </div>
 ))
 ) : (
 <p className="py-8 text-center text-sm text-muted-foreground">No registrations yet</p>
 )}
 </CardContent>
 </Card>
 </>
 )}
 </div>
 );
}
