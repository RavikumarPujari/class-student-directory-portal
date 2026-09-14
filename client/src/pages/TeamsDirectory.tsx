import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Shield, Calendar, Code } from "lucide-react";
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
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Teams Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse active teams and request to join</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">No teams found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search</p>
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
                <Card className="h-full flex flex-col border-border bg-card hover:border-teal/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{team.name}</CardTitle>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap ml-2">
                        {team.memberCount} / {team.maxSize}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2 text-xs">
                      <Shield className="h-3 w-3 text-gold" /> Leader: {team.leader.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {team.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{team.description}</p>
                    )}
                    {team.requiredSkills && (
                      <div className="mb-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-2">
                          <Code className="h-3 w-3" /> Required Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {team.requiredSkills.split(",").slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] bg-teal/10 text-teal px-1.5 py-0.5 rounded border border-teal/20">
                              {s.trim()}
                            </span>
                          ))}
                          {team.requiredSkills.split(",").length > 3 && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              +{team.requiredSkills.split(",").length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isStudentAuthenticated && !isLeader && (
                      <Button
                        className="w-full mt-4 bg-teal hover:bg-teal/90 text-black font-semibold"
                        disabled={isFull}
                        onClick={() => handleJoinRequest(team.id)}
                      >
                        {isFull ? "Team Full" : "Request to Join"}
                      </Button>
                    )}
                    {isLeader && (
                      <Button className="w-full mt-4" variant="outline" disabled>
                        Your Team
                      </Button>
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
