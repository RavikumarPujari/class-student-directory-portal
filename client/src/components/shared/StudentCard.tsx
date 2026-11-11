import { motion } from "framer-motion";
import { Linkedin, Github, Globe, Copy, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";
import { Student } from "@/types";

export function StudentCard({ student, index = 0 }: { student: Student; index?: number }) {
  const { toast } = useToast();
  const skills = (student.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function copyToClipboard(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: `${label} copied to clipboard`, variant: "success" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
    >
      <Card className="group h-full rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start gap-3.5">
            <Avatar className="h-12 w-12 border border-slate-200 shadow-xs">
              <AvatarImage src={student.photo || undefined} alt={student.name} />
              <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold text-base">
                {student.name ? student.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {student.name}
              </h3>
              <p className="text-xs font-mono text-slate-500">{student.usn}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {student.branch || "CSE"}
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Sec {student.section}
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Sem {student.semester}
                </span>
                {student.favoriteDomain && (
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {student.favoriteDomain}
                  </span>
                )}
              </div>
            </div>
          </div>

          {student.bio && (
            <p className="mt-3.5 line-clamp-2 text-xs text-slate-600 leading-relaxed">
              {student.bio}
            </p>
          )}

          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 flex items-center gap-2 border-t border-slate-100">
            {student.linkedin && (
              <Button asChild size="sm" variant="outline" className="flex-1 h-8 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50">
                <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {student.github && (
              <Button asChild size="sm" variant="outline" className="flex-1 h-8 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50">
                <a href={student.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {student.portfolio && (
              <Button asChild size="sm" variant="outline" className="flex-1 h-8 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50">
                <a href={student.portfolio} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              onClick={() => copyToClipboard(student.email, "Email")}
              title="Copy email"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
