import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentForm } from "@/components/shared/StudentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  fetchStudents,
  updateStudent,
  deleteStudent,
  clearAllStudents,
  downloadExport,
} from "@/services/students.service";
import { getErrorMessage } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { Student, Pagination } from "@/types";
import { StudentFormSchema } from "@/utils/validation";

const PAGE_SIZE = 10;

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const { toast } = useToast();

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStudents({ search: search || undefined, page, limit: PAGE_SIZE, sortBy: "createdAt", order: "desc" });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(loadStudents, 300);
    return () => clearTimeout(t);
  }, [loadStudents]);

  useEffect(() => setPage(1), [search]);

  async function handleUpdate(values: StudentFormSchema) {
    if (!editingStudent) return;
    setSaving(true);
    try {
      await updateStudent(editingStudent.id, {
        ...values,
        portfolio: values.portfolio || undefined,
        bio: values.bio || undefined,
      });
      toast({ title: "Student updated", variant: "success" });
      setEditingStudent(null);
      loadStudents();
    } catch (err) {
      toast({ title: "Update failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingStudent) return;
    setDeleting(true);
    try {
      await deleteStudent(deletingStudent.id);
      toast({ title: "Student removed", variant: "success" });
      setDeletingStudent(null);
      loadStudents();
    } catch (err) {
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

async function handleExport(format: "csv" | "excel") {
    setExporting(format);
    try {
      await downloadExport(format);
      toast({ title: "Export ready", variant: "success" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  }

async function handleClearAll() {
    setClearingAll(true);
    try {
      const { count } = await clearAllStudents();
      setClearAllOpen(false);
      if (count === 0) {
        toast({ title: "No students to clear", description: "The directory is already empty.", variant: "default" });
      } else {
        toast({
          title: "Directory cleared",
          description: `Removed ${count} student${count > 1 ? "s" : ""}.`,
          variant: "success",
        });
      }
      loadStudents();
    } catch (err) {
      toast({ title: "Clear failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination ? `${pagination.total} total students` : "Manage all registered students"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting !== null}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
<Button variant="teal" size="sm" onClick={() => handleExport("excel")} disabled={exporting !== null}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setClearAllOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </Button>
        </div>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Try a different search term." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-4 font-medium">Student</th>
                    <th className="px-5 py-4 font-medium">Section</th>
                    <th className="px-5 py-4 font-medium">Domain</th>
                    <th className="px-5 py-4 font-medium">Contact</th>
                    <th className="px-5 py-4 font-medium">Links</th>
                    <th className="px-5 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={s.photo || undefined} alt={s.name} />
                            <AvatarFallback className="text-xs">{s.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.usn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline">{s.section}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{s.favoriteDomain}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <p>{s.email}</p>
                        <p className="text-xs">{s.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => setEditingStudent(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeletingStudent(s)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      {/* Edit dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update {editingStudent?.name}'s profile details.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <StudentForm
              defaultValues={editingStudent}
              onSubmit={handleUpdate}
              isSubmitting={saving}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingStudent?.name}</strong> from the
              directory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
<DialogFooter>
            <Button variant="outline" onClick={() => setDeletingStudent(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All confirmation dialog */}
      <Dialog open={clearAllOpen} onOpenChange={(open) => !open && setClearAllOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear All Students</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>all students</strong> from the directory. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearAllOpen(false)} disabled={clearingAll}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={clearingAll}>
              {clearingAll ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
