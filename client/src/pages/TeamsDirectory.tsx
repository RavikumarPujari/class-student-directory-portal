import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Shield, Calendar, Code, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card p-6 rounded-xl border border-border/50 shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-teal" />
            Teams Directory
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">Discover active teams, review their required skills, and send a request to collaborate on the next big project.</p>
        </div>
        <div className="relative w-full sm:w-80 z-10">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by team name or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus:border-teal/50 h-11"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border/50 shadow-inner">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No teams found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">We couldn't find any teams matching your current search criteria. Try using different keywords.</p>
          <Button variant="outline" className="mt-6 border-border text-foreground hover:bg-muted" onClick={() => setSearch("")}>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isFull ? 'border-border/40 bg-card/40' : 'border-border/70 bg-card hover:border-teal/50'}`}>
                  {/* Accent Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${isFull ? 'bg-muted' : 'bg-gradient-to-r from-teal to-gold'}`} />
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <CardTitle className={`text-xl leading-tight line-clamp-1 ${isFull ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {team.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs font-medium">
                          <Shield className={`h-3.5 w-3.5 ${isFull ? 'text-muted-foreground' : 'text-gold'}`} />
                          <span className="truncate max-w-[120px]">{team.leader.name}</span>
                        </CardDescription>
                      </div>
                      
                      {/* Progress Circle or Badge */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${isFull ? 'bg-muted/50 text-muted-foreground border-border/50' : 'bg-teal/10 text-teal border-teal/20'}`}>
                          {team.memberCount} / {team.maxSize} {isFull ? 'Full' : 'Slots'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="flex-1 space-y-4">
                      <p className={`text-sm line-clamp-2 ${isFull ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {team.description || "No description provided."}
                      </p>

                      {team.requiredSkills && (
                        <div className="space-y-2">
                          <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${isFull ? 'text-muted-foreground/70' : 'text-foreground/70'}`}>
                            <Code className="h-3 w-3" /> Skills
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {team.requiredSkills.split(",").slice(0, 4).map((s, i) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${isFull ? 'bg-background/50 border-border/50 text-muted-foreground/70' : 'bg-background border-border text-foreground hover:border-teal/30 transition-colors'}`}>
                                {s.trim()}
                              </span>
                            ))}
                            {team.requiredSkills.split(",").length > 4 && (
                              <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md text-muted-foreground font-medium">
                                +{team.requiredSkills.split(",").length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border/40">
                      {isStudentAuthenticated ? (
                        isLeader ? (
                          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground py-2 border border-dashed border-border rounded-md bg-muted/20">
                            <CheckCircle2 className="h-4 w-4" /> You manage this team
                          </div>
                        ) : (
                          <Button
                            className={`w-full font-semibold transition-all shadow-sm ${isFull ? 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed' : 'bg-teal hover:bg-teal/90 text-black hover:shadow-teal/20'}`}
                            disabled={isFull}
                            onClick={() => handleJoinRequest(team.id)}
                          >
                            {isFull ? "Team Capacity Reached" : "Request to Join Team"}
                          </Button>
                        )
                      ) : (
                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/student/login'}>
                          Login to Join
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
