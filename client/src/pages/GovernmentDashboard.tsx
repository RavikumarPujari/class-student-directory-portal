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
import { fetchGovernmentStats } from "@/services/auth.service";
import { downloadExport } from "@/services/students.service";
import { useToast } from "@/hooks/useToast";
import { DashboardStats } from "@/types";

const COLORS = ["#D4AF37", "#2DD4BF", "#E8C965", "#5EEAD4", "#B8952E", "#0F766E"];

export function GovernmentDashboard() {
 const [stats, setStats] = useState<any | null>(null);
 const [loading, setLoading] = useState(true);
 const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
 const [now, setNow] = useState<Date>(() => new Date());
 const { toast } = useToast();

 useEffect(() => {
 const timer = setInterval(() => setNow(new Date()), 1000);
 return () => clearInterval(timer);
 }, []);

 useEffect(() => {
 fetchGovernmentStats()
 .then(setStats)
 .catch(() =>
 toast({ title: "Failed to load dashboard", description: "Please try again.", variant: "destructive" })
 )
 .finally(() => setLoading(false));
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
 <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Government Dashboard</h1>
 <p className="mt-1 text-sm text-muted-foreground">Aggregated data view</p>
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

 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon={Users} accent="gold" index={0} />
 <StatCard label="Branches Active" value={stats?.studentsByBranch?.length ?? 0} icon={Layers} accent="teal" index={1} />
 <StatCard label="Years Active" value={stats?.studentsByYear?.length ?? 0} icon={TrendingUp} accent="gold" index={2} />
 <StatCard label="Recent Signups" value={stats?.recentRegistrations?.length ?? 0} icon={Clock} accent="teal" index={3} />
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Recent Registrations</CardTitle>
 <CardDescription>The last 5 students to join the directory</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {stats && stats.recentRegistrations?.length > 0 ? (
 stats.recentRegistrations.map((s: any) => (
 <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
 <div className="flex items-center gap-3">
 <div>
 <p className="text-sm font-medium">{s.name}</p>
 <p className="text-xs text-muted-foreground">{s.branch}</p>
 </div>
 </div>
 <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
 </div>
 ))
 ) : (
 <p className="py-8 text-center text-sm text-muted-foreground">No registrations yet</p>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
