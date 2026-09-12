import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Loader2, Info, X, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useToast } from "@/hooks/useToast";
import { teamsService } from "@/services/teams.service";
import { getErrorMessage } from "@/services/api";

export function CreateTeam() {
 const { isStudentAuthenticated, student } = useStudentAuth();
 const navigate = useNavigate();
 const { toast } = useToast();
 
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 name: "",
 description: "",
 maxSize: 5
 });

 const [skills, setSkills] = useState<string[]>([]);
 const [currentSkill, setCurrentSkill] = useState("");

 useEffect(() => {
 if (!isStudentAuthenticated) {
 navigate("/student/login");
 }
 }, [isStudentAuthenticated, navigate]);

 const handleAddSkill = (e?: React.MouseEvent | React.KeyboardEvent) => {
 if (e) e.preventDefault();
 const normalized = currentSkill.trim();
 if (!normalized) return;
 
 // Prevent duplicate case-insensitive matches
 if (skills.some(s => s.toLowerCase() === normalized.toLowerCase())) {
 toast({
 title: "Duplicate skill",
 description: "This skill is already in the list.",
 variant: "destructive"
 });
 return;
 }

 setSkills([...skills, normalized]);
 setCurrentSkill("");
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === "Enter") {
 e.preventDefault();
 handleAddSkill();
 }
 };

 const handleRemoveSkill = (skillToRemove: string) => {
 setSkills(skills.filter(s => s !== skillToRemove));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 
 try {
 const payload = {
 ...formData,
 requiredSkills: skills.length > 0 ? skills.join(", ") : undefined
 };

 await teamsService.createTeam(payload);
 toast({
 title: "Team Created!",
 description: "Team created successfully.",
 });
 navigate("/student/teams/me");
 } catch (err) {
 toast({
 variant: "destructive",
 title: "Failed to create team",
 description: getErrorMessage(err),
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="container py-12 px-4 sm:px-6 lg:px-8">
 <div className="mb-6 max-w-5xl mx-auto">
 <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground group">
 <Link to="/student/teams/me" className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
 <ArrowLeft className="mr-2 h-4 w-4" />
 Back to Teams
 </Link>
 </Button>
 </div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
 >
 {/* FORM SIDE */}
 <Card className="border-border bg-card shadow-2xl relative overflow-hidden flex flex-col h-full">
 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal to-gold"></div>
 <CardHeader className="space-y-2 pb-6 border-b border-border bg-card">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-teal/10 text-teal rounded-xl border border-teal/20">
 <Users className="h-6 w-6" />
 </div>
 <CardTitle className="text-2xl font-display font-bold text-foreground">Create Your Team</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="pt-6 flex-1 flex flex-col">
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div className="space-y-2">
 <label htmlFor="name" className="text-sm font-semibold text-gray-200">
 Team Name <span className="text-rose-500">*</span>
 </label>
 <input
 id="name"
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="flex h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 transition-all placeholder:text-muted-foreground"
 placeholder="e.g., Web Wizards"
 minLength={2}
 maxLength={100}
 />
 <p className="text-xs text-muted-foreground">Choose a clear name for your project team.</p>
 </div>

 <div className="space-y-2">
 <label htmlFor="description" className="text-sm font-semibold text-gray-200">
 Description
 </label>
 <textarea
 id="description"
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 className="flex min-h-[100px] w-full rounded-lg border border-border bg-muted px-3 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 transition-all placeholder:text-muted-foreground resize-y"
 placeholder="What is your team building? Share some details..."
 maxLength={500}
 />
 <p className="text-xs text-muted-foreground">Briefly describe what your team plans to build.</p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-200">
 Required Skills
 </label>
 <div className="flex gap-2">
 <input
 type="text"
 value={currentSkill}
 onChange={(e) => setCurrentSkill(e.target.value)}
 onKeyDown={handleKeyDown}
 className="flex h-11 flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 transition-all placeholder:text-muted-foreground"
 placeholder="e.g., Python, React"
 maxLength={50}
 />
 <Button 
 type="button" 
 onClick={handleAddSkill}
 variant="outline"
 className="h-11 border-border bg-muted hover:bg-muted text-foreground shrink-0"
 >
 <Plus className="h-4 w-4 mr-2" />
 Add Skill
 </Button>
 </div>
 <p className="text-xs text-muted-foreground">Add the skills you need from your teammates.</p>

 {skills.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3 p-3 bg-card border border-border rounded-lg min-h-[4rem]">
 {skills.map((skill) => (
 <span 
 key={skill} 
 className="inline-flex items-center gap-1 rounded-md bg-teal/10 px-2.5 py-1 text-sm font-medium text-teal border border-teal/20"
 >
 {skill}
 <button
 type="button"
 onClick={() => handleRemoveSkill(skill)}
 className="ml-1 rounded-full p-0.5 hover:bg-teal/20 transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
 aria-label={`Remove ${skill}`}
 >
 <X className="h-3 w-3" />
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-2">
 <label htmlFor="maxSize" className="text-sm font-semibold text-gray-200">
 Maximum Members
 </label>
 <input
 id="maxSize"
 type="number"
 min={2}
 max={50}
 value={formData.maxSize}
 onChange={(e) => setFormData({...formData, maxSize: parseInt(e.target.value) || 5})}
 className="flex h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 transition-all"
 />
 <p className="text-xs text-muted-foreground">Choose the maximum number of students.</p>
 </div>

 <div className="pt-4 mt-auto">
 <Button type="submit" className="w-full h-11 bg-teal hover:bg-teal/90 text-black font-semibold text-[15px] shadow-sm" disabled={isSubmitting}>
 {isSubmitting ? (
 <>
 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
 Creating Team...
 </>
 ) : (
 "Create Team"
 )}
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>

 {/* PREVIEW SIDE */}
 <div className="hidden lg:block">
 <div className="sticky top-8">
 <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Team Preview</h3>
 <Card className="border-border bg-card overflow-hidden relative">
 <div className="absolute top-0 left-0 w-1.5 h-full bg-teal"></div>
 
 <CardHeader className="pb-4 border-b border-border bg-card">
 <div className="flex flex-col justify-between items-start gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <CardTitle className="text-2xl font-bold text-foreground opacity-90 break-all">
 {formData.name || "Team Name"}
 </CardTitle>
 <span className="inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/30 shrink-0">
 <Shield className="mr-1.5 h-3 w-3" /> Leader
 </span>
 </div>
 </div>
 </div>
 </CardHeader>

 <CardContent className="p-0">
 <div className="p-6 flex flex-col space-y-6">
 <div>
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About Team</h4>
 <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
 {formData.description || <span className="italic text-muted-foreground">No description provided.</span>}
 </p>
 </div>

 <div>
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Required Skills</h4>
 {skills.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {skills.map(s => (
 <span key={s} className="bg-teal/10 border border-teal/20 text-teal text-xs font-medium px-2.5 py-1 rounded-md">
 {s}
 </span>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground italic opacity-50">Add required skills to find better team matches.</p>
 )}
 </div>
 
 <div className="pt-2">
 <div className="flex justify-between items-end mb-2">
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</h4>
 <span className="text-sm font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-md">
 1 / {formData.maxSize} Members
 </span>
 </div>
 <div className="w-full bg-muted rounded-full h-2.5 border border-border overflow-hidden">
 <div 
 className="bg-teal h-full transition-all" 
 style={{ width: `${Math.min(100, (1 / formData.maxSize) * 100)}%` }}
 />
 </div>
 </div>

 <div className="pt-6 border-t border-border">
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Team Roster</h4>
 <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
 <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
 {student?.photo ? (
 <img src={student.photo} alt={student.name} className="h-full w-full object-cover rounded-xl" />
 ) : (
 <Users className="h-4 w-4 text-gold" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground truncate flex items-center gap-2">
 {student?.name || "You"}
 <span className="bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Leader</span>
 </p>
 <p className="text-xs text-muted-foreground truncate">{student?.branch} • {student?.usn}</p>
 </div>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
