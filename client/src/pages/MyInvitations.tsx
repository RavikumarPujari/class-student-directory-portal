import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailOpen, User, CheckCircle2, XCircle, Loader2, Clock, Inbox } from "lucide-react";
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
      // Optionally redirect to My Teams after a short delay
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const pendingCount = invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length;

  return (
    <div className="container max-w-5xl py-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-white group">
            <Link to="/student/profile" className="flex items-center text-muted-foreground group-hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <MailOpen className="h-8 w-8 text-teal" />
            Team Invitations
            {pendingCount > 0 && (
              <span className="bg-teal text-black text-sm px-3 py-0.5 rounded-full font-bold ml-2 shadow-glow-teal">
                {pendingCount} New
              </span>
            )}
          </h1>
        </div>
      </div>

      {invitations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 px-4 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/5"
        >
          <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <Inbox className="h-10 w-10 text-white/40" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No pending invitations.</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            When a team leader invites you to join their team, it will appear here.
          </p>
          <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-black font-semibold">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                <Card className={`h-full border-white/10 bg-black/40 backdrop-blur-md overflow-hidden relative transition-all flex flex-col ${isPending ? "hover:bg-black/60 shadow-lg" : "opacity-75"}`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isPending ? "bg-teal" : inv.status === "ACCEPTED" ? "bg-gold" : "bg-muted-foreground/30"}`}></div>
                  
                  <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-white mb-1">{inv.teamName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Sent {new Date(inv.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      
                      {!isPending && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          inv.status === "ACCEPTED" ? "bg-gold/20 text-gold border-gold/30" :
                          inv.status === "DECLINED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-white/5 text-muted-foreground border-white/10"
                        }`}>
                          {inv.status === "ACCEPTED" && <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                          {inv.status === "DECLINED" && <XCircle className="mr-1.5 h-3 w-3" />}
                          {inv.status === "PENDING" && isExpired && "EXPIRED"}
                          {inv.status !== "PENDING" && inv.status}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6 flex flex-col flex-1 gap-6">
                    {inv.teamDescription && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Description</h4>
                        <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-300 border border-white/5">
                          {inv.teamDescription}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Invited by Leader</h4>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal font-bold shrink-0">
                            {inv.leader?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">{inv.leader?.name || "Unknown"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {inv.team?.memberCount !== undefined && inv.team?.maxSize !== undefined && (
                        <div className="text-left">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Team</h4>
                          <span className="text-sm font-bold text-white bg-white/10 px-2.5 py-1 rounded-md">
                            {inv.team.memberCount} / {inv.team.maxSize} members
                          </span>
                        </div>
                      )}
                    </div>

                    {inv.team?.requiredSkills && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {inv.team.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                            <span key={skill} className="bg-white/5 border border-white/10 text-gray-300 text-xs font-medium px-2 py-1 rounded-md">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {isPending && (
                      <div className="pt-5 mt-auto border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/50 transition-colors"
                          onClick={() => handleDecline(inv.token)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingToken === inv.token ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                          Decline
                        </Button>
                        <Button 
                          className="w-full sm:w-auto bg-teal hover:bg-teal/90 text-black font-semibold shadow-glow-teal"
                          onClick={() => handleAccept(inv.token)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingToken === inv.token ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
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
