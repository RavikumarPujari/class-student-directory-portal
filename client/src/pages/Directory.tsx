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
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-glow">
            <CardContent className="flex flex-col items-center p-10 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal/10 text-teal">
                <Lock className="h-9 w-9" />
              </div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Student Directory</h1>
              <p className="mt-4 text-muted-foreground">
                Please <span className="font-semibold text-gold">register</span> or{" "}
                <span className="font-semibold text-gold">login</span> to view the Student Directory.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="flex-1">
                  <Link to="/student/login">
                    <LogIn className="h-4 w-4" /> Student Login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/register">
                    <UserPlus className="h-4 w-4" /> Student Registration
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
    <div className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
          <Users className="h-6 w-6" />
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Student Directory</h1>
        <p className="mt-2 text-muted-foreground">
          {pagination ? `${pagination.total} students registered so far` : "Browse all registered students"}
        </p>
      </motion.div>

      <div className="glass-card mb-8 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, USN, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="md:w-40">
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
            <SelectTrigger className="md:w-48">
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
            <SelectTrigger className="md:w-48">
              <SlidersHorizontal className="h-3.5 w-3.5" />
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
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try adjusting your search or filters, or check back after someone registers."
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student, i) => (
              <StudentCard key={student.id} student={student} index={i} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
