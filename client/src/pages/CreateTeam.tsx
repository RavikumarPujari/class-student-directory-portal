import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Loader2, Info, X, Plus, Shield, Users2, Sparkles } from "lucide-react";
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
        variant: "success",
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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Create Project Team
              </h1>
              <p className="text-sm text-slate-500">
                Set up a new team, define needed skills, and recruit your classmates
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
          <Link to="/student/teams/me" className="flex items-center">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to My Teams
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* FORM SIDE */}
        <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col h-full">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
          <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100">
            <CardTitle className="text-lg font-bold font-display text-slate-900">Team Details</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Fill in your project specifications and desired team member skills
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Team Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., DevEngers, Cloud Pioneers"
                  minLength={2}
                  maxLength={100}
                />
                <p className="text-[11px] text-slate-400">Choose a clear name for your project team.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 resize-y"
                  placeholder="What is your team building? Share some project scope details..."
                  maxLength={500}
                />
                <p className="text-[11px] text-slate-400">Briefly describe what your team plans to build.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Required Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g., Python, React, AI"
                    maxLength={50}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddSkill}
                    variant="outline"
                    className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Skill
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">Add the skills you need from prospective teammates.</p>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl min-h-[3rem]">
                    {skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-indigo-200/60 transition-colors focus:outline-none"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="maxSize" className="text-xs font-semibold text-slate-700">
                  Maximum Team Members
                </label>
                <input
                  id="maxSize"
                  type="number"
                  min={2}
                  max={50}
                  value={formData.maxSize}
                  onChange={(e) => setFormData({...formData, maxSize: parseInt(e.target.value) || 5})}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                />
                <p className="text-[11px] text-slate-400">Choose the maximum team capacity (e.g. 5 students).</p>
              </div>

              <div className="pt-3 mt-auto">
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating Team...
                    </span>
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
          <div className="sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pl-1">Live Card Preview</h3>
            <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden relative">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
              
              <CardHeader className="pb-3 pt-5 px-5 border-b border-slate-100">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 mb-1.5">
                      {formData.name || "Untitled Team"}
                    </CardTitle>
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                      <Shield className="mr-1 h-3 w-3 text-amber-600" /> Leader
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 flex flex-col space-y-4">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">About Team</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {formData.description || <span className="italic text-slate-400">No description provided yet.</span>}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Required Skills</h4>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {skills.map(s => (
                        <span key={s} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Add required skills to find better matches.</p>
                  )}
                </div>
                
                <div className="pt-1">
                  <div className="flex justify-between items-end mb-1 text-xs">
                    <span className="font-semibold text-slate-500">Capacity</span>
                    <span className="font-bold text-slate-800">
                      1 / {formData.maxSize} Members
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all" 
                      style={{ width: `${Math.min(100, (1 / formData.maxSize) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Team Creator</h4>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {student?.name ? student.name.charAt(0).toUpperCase() : <Users className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {student?.name || "You"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{student?.branch || "CSE"} • {student?.usn}</p>
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
export default CreateTeam;
