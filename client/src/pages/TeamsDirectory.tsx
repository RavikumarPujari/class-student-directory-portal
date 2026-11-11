import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Shield, Code, CheckCircle2, Users2, ArrowLeft, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { useToast } from "@/hooks/useToast";

export function TeamsDirectory() {
  const { isStudentAuthenticated, student } = useStudentAuth();
  const [teams, setTeams] = useState<PopulatedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    try {
      const data = await teamsService.getAllTeams();
      setTeams(data);
    } catch {
      toast({ title: "Failed to load teams", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRequest(teamId: string) {
    try {
      await teamsService.requestToJoinTeam(teamId);
      toast({ title: "Join request sent successfully", variant: "success" });
    } catch (err: any) {
      toast({ 
        title: "Failed to send request", 
        description: err.response?.data?.message || err.message,
        variant: "destructive" 
      });
    }
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.requiredSkills && t.requiredSkills.toLowerCase().includes(search.toLowerCase()))
  );

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
                Teams Directory
              </h1>
              <p className="text-sm text-slate-500">
                Discover active student teams, review needed skills, and collaborate on projects
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
            <Link to="/student/teams/me">My Teams</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
            <Link to="/student/teams/create">
              <UserPlus className="mr-1.5 h-4 w-4" /> Create Team
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search teams by name or required skills (e.g. React, Python, Cloud)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center mb-3">
            <Search className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">No teams found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            We couldn't find any teams matching your search. Try different keywords or clear your search.
          </p>
          <Button variant="outline" size="sm" className="mt-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs" onClick={() => setSearch("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team, idx) => {
            const isFull = team.memberCount >= team.maxSize;
            const isLeader = student && team.leaderId === student.id;
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="h-full flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all overflow-hidden relative">
                  <div className={`h-1.5 w-full ${isFull ? 'bg-slate-200' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`} />
                  
                  <CardHeader className="pb-3 pt-5 px-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">
                          {team.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Shield className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="truncate max-w-[130px] font-medium text-slate-700">{team.leader.name}</span>
                        </CardDescription>
                      </div>
                      
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        isFull 
                          ? 'bg-slate-100 text-slate-500 border-slate-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {team.memberCount} / {team.maxSize} {isFull ? 'Full' : 'Members'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col px-5 pb-5 pt-0">
                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {team.description || "No description provided."}
                      </p>

                      {team.requiredSkills && (
                        <div>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            <Code className="h-3 w-3" /> Required Skills
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {team.requiredSkills.split(",").slice(0, 4).map((s, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                {s.trim()}
                              </span>
                            ))}
                            {team.requiredSkills.split(",").length > 4 && (
                              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-medium">
                                +{team.requiredSkills.split(",").length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {isStudentAuthenticated ? (
                        isLeader ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-700 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                            <CheckCircle2 className="h-3.5 w-3.5" /> You manage this team
                          </div>
                        ) : (
                          <Button
                            className={`w-full h-10 rounded-xl text-xs font-semibold transition-all ${
                              isFull 
                                ? 'bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed border border-slate-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                            disabled={isFull}
                            onClick={() => handleJoinRequest(team.id)}
                          >
                            {isFull ? "Team Capacity Reached" : "Request to Join Team"}
                          </Button>
                        )
                      ) : (
                        <Button 
                          asChild
                          variant="outline"
                          className="w-full h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                        >
                          <Link to="/student/login">Login to Join</Link>
                        </Button>
                      )}
                    </div>
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
export default TeamsDirectory;
