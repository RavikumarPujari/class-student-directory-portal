import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Users, User, Shield, Calendar, Loader2, UserPlus, Trash2, 
  MoreVertical, Sparkles, Send, MessageSquareText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { InviteStudentsModal } from "@/components/teams/InviteStudentsModal";
import { TeamRoadmap } from "@/components/teams/TeamRoadmap";

export function MyTeam() {
  const { isStudentAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState<PopulatedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTeamForInvite, setActiveTeamForInvite] = useState<PopulatedTeam | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [activeTeamForRoadmap, setActiveTeamForRoadmap] = useState<PopulatedTeam | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!isStudentAuthenticated) {
      navigate("/student/login");
      return;
    }

    async function fetchTeams() {
      try {
        const data = await teamsService.getMyTeams();
        setTeams(data);
      } catch (err) {
        console.error("Failed to fetch teams", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeams();
  }, [isStudentAuthenticated, navigate]);

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm("This will permanently delete the team and all its messages — are you sure?")) {
      try {
        await teamsService.deleteTeam(teamId);
        setTeams(teams.filter(t => t.id !== teamId));
        // Note: useToast could be used here
        alert("Team deleted successfully");
      } catch (err) {
        console.error(err);
      }
    }
    setActiveDropdown(null);
  };

  const handleSubmitReview = async (teamId: string) => {
    try {
      await teamsService.submitTeam(teamId);
      setTeams(teams.map(t => t.id === teamId ? { ...t, approvalStatus: "PENDING_APPROVAL" } : t));
    } catch (err) {
      console.error(err);
    }
    setActiveDropdown(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground group">
            <Link to="/student/profile" className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-display font-extrabold text-foreground">My Teams</h1>
        </div>
        <Button asChild className="bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm">
          <Link to="/student/teams/create"><UserPlus className="mr-2 h-4 w-4" /> Create New Team</Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You don't have any teams yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Start your own collaborative workspace or wait for an invitation from your classmates.
          </p>
          <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-black font-semibold">
            <Link to="/student/teams/create">Create a Team</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col border-border bg-card relative hover:border-teal/30 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal to-gold"></div>
                
                <CardHeader className="pb-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground mb-2">{team.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {team.isLeader && (
                          <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/20">
                            <Shield className="mr-1 h-3 w-3" /> Leader
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                          team.approvalStatus === "APPROVED" ? "bg-teal/10 text-teal border-teal/20" :
                          team.approvalStatus === "PENDING_APPROVAL" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                          team.approvalStatus === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {team.approvalStatus === "PENDING_APPROVAL" ? "PENDING" : team.approvalStatus}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === team.id ? null : team.id)}
                        className="p-2 -mr-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === team.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
                            >
                              <div className="py-1">
                                {team.isLeader && (
                                  <>
                                    <button 
                                      className="flex w-full items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                                      onClick={() => { setActiveTeamForInvite(team); setInviteModalOpen(true); setActiveDropdown(null); }}
                                    >
                                      <UserPlus className="mr-2 h-4 w-4 text-teal" /> Invite Students
                                    </button>
                                    <button 
                                      className="flex w-full items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                                      onClick={() => { setActiveTeamForRoadmap(team); setRoadmapModalOpen(true); setActiveDropdown(null); }}
                                    >
                                      <Sparkles className="mr-2 h-4 w-4 text-gold" /> AI Roadmap
                                    </button>
                                    <button 
                                      className="flex w-full items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                                      onClick={() => { navigate(`/student/teams/${team.id}`); setActiveDropdown(null); }}
                                    >
                                      <MessageSquareText className="mr-2 h-4 w-4 text-teal" /> Ask AI Mentor
                                    </button>
                                    {(team.approvalStatus === "DRAFT" || team.approvalStatus === "REJECTED") && (
                                      <button 
                                        className="flex w-full items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                                        onClick={() => handleSubmitReview(team.id)}
                                      >
                                        <Send className="mr-2 h-4 w-4 text-primary" /> Submit for Review
                                      </button>
                                    )}
                                    <div className="h-px bg-border my-1" />
                                    <button 
                                      className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
                                      onClick={() => handleDeleteTeam(team.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pt-0">
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</span>
                      <span className="text-xs font-bold text-foreground">
                        {team.memberCount} / {team.maxSize}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 border border-border overflow-hidden">
                      <div 
                        className="bg-teal h-full transition-all" 
                        style={{ width: `${Math.min(100, (team.memberCount / team.maxSize) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-6 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredSkills ? (
                        team.requiredSkills.split(',').slice(0, 3).map(s => (
                          <span key={s} className="bg-teal/10 border border-teal/20 text-teal text-[10px] font-medium px-2 py-0.5 rounded">
                            {s.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None specified</span>
                      )}
                      {team.requiredSkills && team.requiredSkills.split(',').length > 3 && (
                        <span className="bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded">
                          +{team.requiredSkills.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-muted hover:bg-teal/10 hover:text-teal border border-border hover:border-teal/30 transition-all group">
                    <Link to={`/student/teams/${team.id}`}>
                      Open Workspace <ArrowLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTeamForInvite && (
        <InviteStudentsModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          teamId={activeTeamForInvite.id}
          memberCount={activeTeamForInvite.memberCount}
          maxSize={activeTeamForInvite.maxSize}
          leaderId={activeTeamForInvite.leader.id}
          existingMemberIds={activeTeamForInvite.members?.map(m => m.id) || [activeTeamForInvite.leader.id]}
          requiredSkillsString={activeTeamForInvite.requiredSkills || undefined}
        />
      )}

      <Dialog open={roadmapModalOpen} onOpenChange={setRoadmapModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-6 w-6 text-gold" /> 
              {activeTeamForRoadmap?.name} - Roadmap
            </DialogTitle>
          </DialogHeader>
          {activeTeamForRoadmap && (
            <TeamRoadmap teamId={activeTeamForRoadmap.id} initialRoadmap={activeTeamForRoadmap.roadmap} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
