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
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: index * 0.05 }}
 whileHover={{ y: -4 }}
 >
 <Card className="group h-full transition-shadow hover:shadow-sm">
 <CardContent className="flex h-full flex-col p-6">
 <div className="flex items-start gap-4">
 <Avatar className="h-14 w-14 border border-border">
 <AvatarImage src={student.photo || undefined} alt={student.name} />
 <AvatarFallback>
 {student.name ? student.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <h3 className="truncate font-display text-base font-bold">{student.name}</h3>
 <p className="text-xs text-muted-foreground">{student.usn}</p>
<div className="mt-1 flex flex-wrap gap-1.5">
 <Badge variant="outline">Sec {student.section}</Badge>
 <Badge variant="outline">{student.branch}</Badge>
 <Badge variant="outline">{student.year} Year</Badge>
 <Badge variant="outline">Sem {student.semester}</Badge>
 <Badge variant="teal">{student.favoriteDomain}</Badge>
 </div>
 </div>
 </div>

 {student.bio && (
 <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{student.bio}</p>
 )}

 {skills.length > 0 && (
 <div className="mt-4 flex flex-wrap gap-1.5">
 {skills.slice(0, 4).map((skill) => (
 <span
 key={skill}
 className="rounded-md bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground"
 >
 {skill}
 </span>
 ))}
 {skills.length > 4 && (
 <span className="rounded-md bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground">
 +{skills.length - 4}
 </span>
 )}
 </div>
 )}

<div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
 {student.linkedin && (
 <Button asChild size="sm" variant="outline" className="flex-1">
 <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
 <Linkedin className="h-3.5 w-3.5" />
 </a>
 </Button>
 )}
 {student.github && (
 <Button asChild size="sm" variant="outline" className="flex-1">
 <a href={student.github} target="_blank" rel="noopener noreferrer">
 <Github className="h-3.5 w-3.5" />
 </a>
 </Button>
 )}
 {student.portfolio && (
 <Button asChild size="sm" variant="outline" className="flex-1">
 <a href={student.portfolio} target="_blank" rel="noopener noreferrer">
 <Globe className="h-3.5 w-3.5" />
 </a>
 </Button>
 )}
 <Button
 size="sm"
 variant="ghost"
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
