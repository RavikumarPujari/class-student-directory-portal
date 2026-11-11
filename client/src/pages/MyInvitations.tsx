import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailOpen, User, CheckCircle2, XCircle, Loader2, Clock, Inbox, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useToast } from "@/hooks/useToast";
import { teamsService } from "@/services/teams.service";
import { getErrorMessage } from "@/services/api";

export function MyInvitations() {
  const { isStudentAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingToken, setProcessingToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isStudentAuthenticated) {
      navigate("/student/login");
      return;
    }
    
    fetchInvitations();
  }, [isStudentAuthenticated, navigate]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await teamsService.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations", err);
      toast({
        variant: "destructive",
        title: "Failed to load invitations",
        description: getErrorMessage(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (token: string) => {
    setProcessingToken(token);
    try {
      await teamsService.acceptInvitation(token);
      toast({
        title: "Invitation Accepted",
        description: "You have successfully joined the team.",
      });
      // Mark as accepted locally
      setInvitations(prev => prev.map(inv => inv.token === token ? { ...inv, status: "ACCEPTED" } : inv));
      setTimeout(() => navigate("/student/teams/me"), 1500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Accept Failed",
        description: getErrorMessage(err)
      });
    } finally {
      setProcessingToken(null);
    }
  };

  const handleDecline = async (token: string) => {
    setProcessingToken(token);
    try {
      await teamsService.declineInvitation(token);
      toast({
        title: "Invitation Declined",
        description: "You have declined the team invitation.",
      });
      // Mark as declined locally
      setInvitations(prev => prev.map(inv => inv.token === token ? { ...inv, status: "DECLINED" } : inv));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Decline Failed",
        description: getErrorMessage(err)
      });
    } finally {
      setProcessingToken(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const pendingCount = invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <MailOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Team Invitations
                </h1>
                {pendingCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Review and respond to invitations sent by project team leaders
              </p>
            </div>
          </div>
        </div>
      </div>

      {invitations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs"
        >
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1 font-display">No Pending Invitations</h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            When a team leader invites you to join their project team, it will appear here.
          </p>
          <Button asChild size="default" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
            <Link to="/student/teams/me">Go to My Teams</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {invitations.map((inv, idx) => {
            const isExpired = new Date(inv.expiresAt) < new Date();
            const isPending = inv.status === "PENDING" && !isExpired;
            const isProcessing = processingToken === inv.token;

            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="h-full"
              >
                <Card className={`h-full border border-slate-200/90 bg-white rounded-2xl overflow-hidden relative transition-all flex flex-col shadow-xs ${isPending ? "hover:shadow-md" : "opacity-85"}`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isPending ? "bg-indigo-600" : inv.status === "ACCEPTED" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  
                  <CardHeader className="pb-3 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900 mb-1">{inv.teamName}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          Sent {new Date(inv.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      
                      {!isPending ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          inv.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          inv.status === "DECLINED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {inv.status === "ACCEPTED" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {inv.status === "DECLINED" && <XCircle className="mr-1 h-3 w-3" />}
                          {inv.status === "PENDING" && isExpired && "EXPIRED"}
                          {inv.status !== "PENDING" && inv.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Action Required
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {inv.invitedBy?.name ? inv.invitedBy.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <div className="text-xs">
                          <p className="text-slate-500">Invited by</p>
                          <p className="font-semibold text-slate-800">{inv.invitedBy?.name || "Team Leader"}</p>
                        </div>
                      </div>

                      {inv.team?.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {inv.team.description}
                        </p>
                      )}

                      {inv.team?.requiredSkills && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Required Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {inv.team.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                              <span key={skill} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isPending && (
                      <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold"
                          onClick={() => handleDecline(inv.token)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingToken === inv.token ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-1.5 h-3.5 w-3.5" />}
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                          onClick={() => handleAccept(inv.token)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingToken === inv.token ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                          Accept Invitation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default MyInvitations;
