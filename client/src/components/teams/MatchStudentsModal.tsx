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
      <span key={i} className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground mr-1 mb-1 border border-border">
        {s.trim()}
      </span>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Find Students for Your Team</DialogTitle>
          <DialogDescription>
            Recommendations based on your team's required skills.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-3 rounded-md border border-border mt-2 mb-4">
          <p className="text-sm font-medium mb-1">Required Skills:</p>
          {requiredSkills ? (
            <div className="flex flex-wrap">
              {requiredSkills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mr-1 mb-1 border border-primary/20">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No required skills have been added to this team.</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No suitable students found.</p>
          ) : (
            candidates.map((candidate) => {
              const isInvited = invitedIds.has(candidate.student.id);
              
              return (
                <div key={candidate.student.id} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={candidate.student.photo || undefined} />
                        <AvatarFallback className="bg-muted text-primary">{candidate.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{candidate.student.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {candidate.student.branch || "Student"} {candidate.student.year ? `• ${candidate.student.year}` : ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{candidate.matchPercentage}%</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {candidate.student.skills && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Skills:</p>
                        <div className="flex flex-wrap">{renderSkillsList(candidate.student.skills.split(","))}</div>
                      </div>
                    )}
                    
                    {candidate.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Matching:</p>
                        <div className="flex flex-wrap">
                          {candidate.matchedSkills.map((s: string, i: number) => (
                            <span key={i} className="inline-flex items-center rounded-sm bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 mr-1 mb-1 border border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {candidate.missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Missing:</p>
                        <div className="flex flex-wrap">
                          {candidate.missingSkills.map((s: string, i: number) => (
                            <span key={i} className="inline-flex items-center rounded-sm bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 mr-1 mb-1 border border-red-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full h-8 text-xs" 
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
