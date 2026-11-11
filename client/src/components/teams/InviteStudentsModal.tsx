import { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, UserPlus, Users, AlertCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { teamsService } from "@/services/teams.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";

interface InviteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  memberCount: number;
  maxSize: number;
  existingMemberIds: string[];
  leaderId: string;
  requiredSkillsString?: string;
}

export function InviteStudentsModal({ isOpen, onClose, teamId, memberCount, maxSize, existingMemberIds, leaderId, requiredSkillsString }: InviteStudentsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const isFull = memberCount >= maxSize;

  const requiredSkills = requiredSkillsString
    ? requiredSkillsString.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen, searchQuery]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await teamsService.getMatchingStudents(teamId, { search: searchQuery });
      setMatches(response || []);
      
      const pendings = response
        .filter((m: any) => m.invitationStatus === "PENDING")
        .map((m: any) => m.student.id);
      
      setPendingInvites(pendings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (studentId: string) => {
    if (isFull) return;
    setProcessingId(studentId);
    try {
      await teamsService.inviteStudent(teamId, studentId);
      setPendingInvites(prev => [...prev, studentId]);
      toast({ title: "Invitation Sent", description: "The student has been invited successfully.", variant: "success" });
    } catch (err) {
      toast({ variant: "destructive", title: "Cannot send invitation", description: getErrorMessage(err) });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col border border-slate-200 bg-white text-slate-900 rounded-2xl shadow-xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-display font-bold text-slate-900">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Invite Teammates
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Find the right students to collaborate with based on skills and availability.
          </DialogDescription>
        </DialogHeader>

        {requiredSkills.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl my-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-1">
              {requiredSkills.map(s => (
                <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/50">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center mb-2 text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Team Capacity</span>
          </div>
          <span className={`font-bold px-2.5 py-0.5 rounded-full ${isFull ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
            {memberCount} / {maxSize} Members
          </span>
        </div>

        {isFull && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2 mb-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Your team has reached its maximum size. You cannot invite more members unless someone leaves.</p>
          </div>
        )}

        <div className="relative my-2 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 pl-10 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
            placeholder="Search by name, USN, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-2">
          {isLoading && matches.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
          ) : matches.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center mx-auto mb-2.5">
                <Search className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium">No students found matching your search.</p>
            </div>
          ) : (
            matches.map((match) => {
              const student = match.student;
              const isMe = student.id === leaderId;
              const isMember = existingMemberIds.includes(student.id);
              const isPending = pendingInvites.includes(student.id);
              const isProcessing = processingId === student.id;

              const isStrongMatch = match.matchPercentage >= 75 && requiredSkills.length > 0;
              const isGoodMatch = match.matchPercentage >= 40 && match.matchPercentage < 75 && requiredSkills.length > 0;
              const showDetails = requiredSkills.length > 0 && match.matchCount > 0;

              return (
                <div key={student.id} className="relative border border-slate-200/90 rounded-xl bg-white shadow-2xs overflow-hidden flex flex-col p-4">
                  {isStrongMatch && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />}
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-start justify-between">
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isStrongMatch ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                            {isStrongMatch && (
                              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200">BEST MATCH</span>
                            )}
                            {isGoodMatch && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">GOOD MATCH</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{student.branch || "CSE"} • {student.favoriteDomain || "Engineering"}</p>
                        </div>
                      </div>

                      {student.skills && (
                        <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                          {student.skills.split(',').map((s: string) => s.trim()).join(' • ')}
                        </p>
                      )}

                      {showDetails && (
                        <div className="mt-1 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {match.matchedSkills.length > 0 && (
                            <div>
                              <p className="font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                                <CheckCircle2 className="h-3 w-3" /> Matched
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {match.matchedSkills.map((s: string) => (
                                  <span key={s} className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.missingSkills.length > 0 && (
                            <div>
                              <p className="font-semibold text-rose-600 flex items-center gap-1 mb-1">
                                <XCircle className="h-3 w-3" /> Missing
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.map((s: string) => (
                                  <span key={s} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 gap-2">
                      {requiredSkills.length > 0 && (
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</p>
                          <p className="text-xs font-bold text-slate-900 leading-none">{match.matchCount} / {requiredSkills.length}</p>
                          <p className={`text-[11px] font-bold ${isStrongMatch ? 'text-indigo-600' : isGoodMatch ? 'text-blue-600' : 'text-slate-400'}`}>{match.matchPercentage}%</p>
                        </div>
                      )}

                      <div className="mt-auto sm:mt-1">
                        {isMe ? (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">You</span>
                        ) : isMember ? (
                          <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Member
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-medium text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleInvite(student.id)}
                            disabled={isFull || isProcessing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs h-8 px-4 rounded-xl"
                          >
                            {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Invite"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default InviteStudentsModal;
