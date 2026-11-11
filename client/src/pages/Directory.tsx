import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Users, ChevronLeft, ChevronRight, SlidersHorizontal, Lock, UserPlus, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentCard } from "@/components/shared/StudentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { fetchStudents, fetchFilterOptions } from "@/services/students.service";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Student, Pagination } from "@/types";

const PAGE_SIZE = 9;

export function Directory() {
  const { isStudentAuthenticated } = useStudentAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<string>("all");
  const [domain, setDomain] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<{ sections: string[]; domains: string[] }>({
    sections: [],
    domains: [],
  });

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStudents({
        search: search || undefined,
        section: section !== "all" ? section : undefined,
        favoriteDomain: domain !== "all" ? domain : undefined,
        sortBy,
        order,
        page,
        limit: PAGE_SIZE,
      });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, section, domain, sortBy, order, page]);

  useEffect(() => {
    const timeout = setTimeout(loadStudents, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [loadStudents]);

  useEffect(() => {
    setPage(1);
  }, [search, section, domain, sortBy, order]);

  if (!isStudentAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/5">
            <CardContent className="flex flex-col items-center p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                <Lock className="h-8 w-8" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Student Directory
              </h1>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Please <span className="font-semibold text-indigo-600">register</span> or{" "}
                <span className="font-semibold text-indigo-600">sign in</span> with your student credentials to view and search full classmate profiles.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  <Link to="/student/login">
                    <LogIn className="h-4 w-4 mr-2" /> Student Login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold">
                  <Link to="/register">
                    <UserPlus className="h-4 w-4 mr-2" /> Register Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Student Directory
              </h1>
              <p className="text-sm text-slate-500">
                {pagination ? `${pagination.total} registered students in directory` : "Browse all registered students"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 md:p-5 shadow-xs">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, USN, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="md:w-40 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {filterOptions.sections.map((s) => (
                <SelectItem key={s} value={s}>
                  Section {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="md:w-48 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {filterOptions.domains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${order}`}
            onValueChange={(v) => {
              const [sb, ord] = v.split("-");
              setSortBy(sb);
              setOrder(ord as "asc" | "desc");
            }}
          >
            <SelectTrigger className="md:w-48 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="usn-asc">USN (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-slate-200/60" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try adjusting your search query or filters."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student, i) => (
              <StudentCard key={student.id} student={student} index={i} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3 pt-4 border-t border-slate-200/80">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-xs font-medium text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default Directory;
