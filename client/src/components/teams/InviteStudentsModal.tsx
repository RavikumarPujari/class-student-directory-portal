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
 
 // Extract already pending ones from the payload
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
 toast({ title: "Invitation Sent", description: "The student has been invited successfully." });
 } catch (err) {
 toast({ variant: "destructive", title: "Cannot send invitation", description: getErrorMessage(err) });
 } finally {
 setProcessingId(null);
 }
 };

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
 <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col border-border bg-card ">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
 <UserPlus className="h-5 w-5 text-teal" />
 Invite Teammates
 </DialogTitle>
 <DialogDescription className="text-muted-foreground">
 Find the right students to collaborate with.
 </DialogDescription>
 </DialogHeader>

 {requiredSkills.length > 0 && (
 <div className="bg-muted border border-border p-4 rounded-lg mb-2">
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Required Skills</h4>
 <div className="flex flex-wrap gap-1.5">
 {requiredSkills.map(s => (
 <span key={s} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border">
 {s}
 </span>
 ))}
 </div>
 </div>
 )}

 <div className="bg-muted border border-border p-3 rounded-lg flex justify-between items-center mb-2">
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm font-medium text-gray-200">Team Capacity</span>
 </div>
 <span className={`text-sm font-bold bg-card px-2 py-0.5 rounded ${isFull ? "text-rose-500" : "text-teal"}`}>
 {memberCount} / {maxSize} Members
 </span>
 </div>

 {isFull && (
 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg flex items-start gap-2 mb-4">
 <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
 <p>Your team has reached its maximum size. You cannot invite more members unless someone leaves.</p>
 </div>
 )}

 <div className="relative mb-4 shrink-0">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <input
 type="text"
 className="flex h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 pl-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 transition-all placeholder:text-muted-foreground"
 placeholder="Search by name, USN, or skills..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>

 <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4 custom-scrollbar">
 {isLoading && matches.length === 0 ? (
 <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
 ) : matches.length === 0 ? (
 <div className="text-center text-muted-foreground py-12">
 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
 <Search className="h-6 w-6 text-muted-foreground" />
 </div>
 <p className="text-sm">No students found matching your criteria.</p>
 </div>
 ) : (
 matches.map((match, idx) => {
 const student = match.student;
 const isMe = student.id === leaderId;
 const isMember = existingMemberIds.includes(student.id);
 const isPending = pendingInvites.includes(student.id);
 const isProcessing = processingId === student.id;

 const isStrongMatch = match.matchPercentage >= 75 && requiredSkills.length > 0;
 const isGoodMatch = match.matchPercentage >= 40 && match.matchPercentage < 75 && requiredSkills.length > 0;
 
 // Only highlight missing if they have at least 1 match but aren't perfect
 const showDetails = requiredSkills.length > 0 && match.matchCount > 0;

 return (
 <div key={student.id} className="relative border border-border rounded-xl bg-card overflow-hidden flex flex-col">
 {isStrongMatch && <div className="absolute top-0 left-0 w-1 h-full bg-teal"></div>}
 
 <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
 <div className="flex flex-col gap-3 min-w-0 flex-1">
 
 <div className="flex items-start gap-3">
 <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${isStrongMatch ? 'bg-teal/10 text-teal border border-teal/20' : 'bg-muted text-gray-300 border border-border'}`}>
 {student.name.charAt(0)}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <p className="text-base font-bold text-foreground truncate">{student.name}</p>
 {isStrongMatch && (
 <span className="bg-teal/20 text-teal text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal/30">BEST MATCH</span>
 )}
 {isGoodMatch && (
 <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">GOOD MATCH</span>
 )}
 </div>
 <p className="text-xs text-muted-foreground truncate">{student.branch} • {student.favoriteDomain}</p>
 </div>
 </div>

 {student.skills && (
 <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-medium">
 {student.skills.split(',').map((s: string) => s.trim()).join(' • ')}
 </p>
 )}

 {showDetails && (
 <div className="mt-2 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 {match.matchedSkills.length > 0 && (
 <div>
 <p className="font-semibold text-teal flex items-center gap-1 mb-1">
 <CheckCircle2 className="h-3 w-3" /> Matched
 </p>
 <div className="flex flex-wrap gap-1">
 {match.matchedSkills.map((s: string) => (
 <span key={s} className="bg-muted text-gray-300 px-1.5 py-0.5 rounded">{s}</span>
 ))}
 </div>
 </div>
 )}
 {match.missingSkills.length > 0 && (
 <div>
 <p className="font-semibold text-rose-400 flex items-center gap-1 mb-1">
 <XCircle className="h-3 w-3" /> Missing
 </p>
 <div className="flex flex-wrap gap-1">
 {match.missingSkills.map((s: string) => (
 <span key={s} className="bg-muted text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 gap-3">
 {requiredSkills.length > 0 && (
 <div className="text-left sm:text-right">
 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Match</p>
 <p className="text-sm font-bold text-foreground leading-none mb-1">{match.matchCount} / {requiredSkills.length}</p>
 <p className={`text-xs font-bold ${isStrongMatch ? 'text-teal' : isGoodMatch ? 'text-blue-400' : 'text-muted-foreground'}`}>{match.matchPercentage}%</p>
 </div>
 )}

 <div className="mt-auto sm:mt-2">
 {isMe ? (
 <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">You</span>
 ) : isMember ? (
 <span className="text-xs font-medium text-teal flex items-center gap-1.5 bg-teal/10 px-3 py-1.5 rounded-lg border border-teal/20">
 <CheckCircle2 className="h-3.5 w-3.5" /> Member
 </span>
 ) : isPending ? (
 <span className="text-xs font-medium text-blue-400 flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
 <CheckCircle2 className="h-3.5 w-3.5" /> Sent
 </span>
 ) : (
 <Button
 size="sm"
 onClick={() => handleInvite(student.id)}
 disabled={isFull || isProcessing}
 className="bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm h-8 w-24"
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
