import { useState, useEffect } from "react";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamsService } from "@/services/teams.service";
import { useToast } from "@/hooks/useToast";

interface MatchStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  requiredSkills: string | null;
}

export function MatchStudentsModal({ open, onOpenChange, teamId, requiredSkills }: MatchStudentsModalProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (open && teamId) {
      if (!requiredSkills || requiredSkills.trim() === "") {
        setCandidates([]);
        setIsLoading(false);
      } else {
        loadMatches();
      }
    }
  }, [open, teamId, requiredSkills]);

  async function loadMatches() {
    setIsLoading(true);
    try {
      const data = await teamsService.getMatchingStudents(teamId);
      setCandidates(data);
      
      const alreadyInvited = new Set<string>();
      data.forEach(c => {
        if (c.invitationStatus === 'PENDING') {
          alreadyInvited.add(c.student.id);
        }
      });
      setInvitedIds(alreadyInvited);
    } catch (err: any) {
      toast({ 
        title: "Failed to load candidates", 
        description: err.response?.data?.message || err.message, 
        variant: "destructive" 
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(studentId: string) {
    try {
      await teamsService.inviteStudent(teamId, studentId);
      setInvitedIds(prev => new Set(prev).add(studentId));
      toast({ title: "Invitation sent", variant: "success" });
    } catch (err: any) {
      toast({ 
        title: "Failed to invite", 
        description: err.response?.data?.message || err.message, 
        variant: "destructive" 
      });
    }
  }

  const renderSkillsList = (skills: string[]) => {
    return skills.map((s, i) => (
      <span key={i} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 mr-1 mb-1">
        {s.trim()}
      </span>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 bg-white text-slate-900 rounded-2xl shadow-xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="font-display font-bold text-lg text-slate-900">Find Students for Your Team</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Recommendations based on your team's required skills.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl my-2">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">Required Skills:</p>
          {requiredSkills ? (
            <div className="flex flex-wrap gap-1">
              {requiredSkills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No required skills have been added to this team.</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No suitable students found.</p>
          ) : (
            candidates.map((candidate) => {
              const isInvited = invitedIds.has(candidate.student.id);
              
              return (
                <div key={candidate.student.id} className="border border-slate-200/90 rounded-xl p-4 bg-white shadow-2xs">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 shadow-2xs">
                        <AvatarImage src={candidate.student.photo || undefined} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">{candidate.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{candidate.student.name}</h4>
                        <p className="text-xs text-slate-500">
                          {candidate.student.branch || "Student"} {candidate.student.year ? `• ${candidate.student.year}` : ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-base font-extrabold text-indigo-600">{candidate.matchPercentage}%</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Match</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3.5 text-xs">
                    {candidate.student.skills && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Skills:</p>
                        <div className="flex flex-wrap">{renderSkillsList(candidate.student.skills.split(","))}</div>
                      </div>
                    )}
                    
                    {candidate.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Matching:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.matchedSkills.map((s: string, i: number) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {candidate.missingSkills.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">Missing:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.missingSkills.map((s: string, i: number) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full h-8 text-xs font-semibold rounded-xl ${
                      isInvited 
                        ? "border border-slate-200 text-slate-500 bg-slate-50" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                    }`}
                    variant={isInvited ? "outline" : "default"}
                    disabled={isInvited}
                    onClick={() => handleInvite(candidate.student.id)}
                  >
                    {isInvited ? "Invitation Sent" : "Invite"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default MatchStudentsModal;
