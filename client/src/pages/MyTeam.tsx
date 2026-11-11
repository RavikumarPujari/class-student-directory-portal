import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Users, User, Shield, Calendar, Loader2, UserPlus, Trash2, 
  MoreVertical, Sparkles, Send, MessageSquareText, Users2, ArrowRight
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                My Teams
              </h1>
              <p className="text-sm text-slate-500">
                Manage, collaborate, and recruit students for your project teams
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
            <Link to="/student/teams/directory">Explore All Teams</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
            <Link to="/student/teams/create">
              <UserPlus className="mr-1.5 h-4 w-4" /> Create New Team
            </Link>
          </Button>
        </div>
      </div>

      {teams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs"
        >
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1 font-display">You don't have any teams yet</h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            Start your own collaborative project team or browse the student team directory to join an existing group.
          </p>
          <Button asChild size="default" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
            <Link to="/student/teams/create">Create a Team</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full flex flex-col border border-slate-200/90 bg-white rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                
                <CardHeader className="pb-3 pt-5 px-5 relative">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 mb-1.5">{team.name}</CardTitle>
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {team.isLeader && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                            <Shield className="mr-1 h-3 w-3 text-amber-600" /> Leader
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                          team.approvalStatus === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          team.approvalStatus === "PENDING_APPROVAL" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          team.approvalStatus === "REJECTED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {team.approvalStatus === "PENDING_APPROVAL" ? "PENDING REVIEW" : team.approvalStatus}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === team.id ? null : team.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Team options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === team.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden py-1 text-xs"
                            >
                              {team.isLeader && (
                                <>
                                  <button 
                                    className="flex w-full items-center px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                                    onClick={() => { setActiveTeamForInvite(team); setInviteModalOpen(true); setActiveDropdown(null); }}
                                  >
                                    <UserPlus className="mr-2 h-3.5 w-3.5 text-indigo-600" /> Invite Students
                                  </button>
                                  <button 
                                    className="flex w-full items-center px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                                    onClick={() => { setActiveTeamForRoadmap(team); setRoadmapModalOpen(true); setActiveDropdown(null); }}
                                  >
                                    <Sparkles className="mr-2 h-3.5 w-3.5 text-amber-500" /> AI Roadmap
                                  </button>
                                  <button 
                                    className="flex w-full items-center px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                                    onClick={() => { navigate(`/student/teams/${team.id}`); setActiveDropdown(null); }}
                                  >
                                    <MessageSquareText className="mr-2 h-3.5 w-3.5 text-indigo-600" /> Ask AI Mentor
                                  </button>
                                  {(team.approvalStatus === "DRAFT" || team.approvalStatus === "REJECTED") && (
                                    <button 
                                      className="flex w-full items-center px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                                      onClick={() => handleSubmitReview(team.id)}
                                    >
                                      <Send className="mr-2 h-3.5 w-3.5 text-blue-600" /> Submit for Review
                                    </button>
                                  )}
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button 
                                    className="flex w-full items-center px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                                    onClick={() => handleDeleteTeam(team.id)}
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Team
                                  </button>
                                </>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col px-5 pb-5 pt-0">
                  <div className="mb-3.5">
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="font-semibold text-slate-500">Team Capacity</span>
                      <span className="font-bold text-slate-800">
                        {team.memberCount} / {team.maxSize} Members
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (team.memberCount / team.maxSize) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-5 flex-1">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {team.requiredSkills ? (
                        team.requiredSkills.split(',').slice(0, 3).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            {s.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">None specified</span>
                      )}
                      {team.requiredSkills && team.requiredSkills.split(',').length > 3 && (
                        <span className="bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-md">
                          +{team.requiredSkills.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Button asChild className="w-full h-10 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 font-semibold text-xs transition-colors group">
                    <Link to={`/student/teams/${team.id}`} className="flex items-center justify-center gap-1.5">
                      Open Workspace <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
        <DialogContent className="max-w-2xl bg-white border-slate-200 overflow-y-auto max-h-[85vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 font-display">
              <Sparkles className="h-5 w-5 text-amber-500" /> 
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
export default MyTeam;
