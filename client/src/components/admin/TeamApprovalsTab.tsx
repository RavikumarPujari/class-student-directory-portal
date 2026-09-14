import { useEffect, useState } from "react";
import { PopulatedTeam } from "@/services/teams.service";
import { adminTeamsService } from "@/services/adminTeams.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check, X, Users, Calendar, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamApprovalsTab() {
  const [teams, setTeams] = useState<PopulatedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    try {
      const data = await adminTeamsService.getPendingTeams();
      setTeams(data);
    } catch {
      toast({ title: "Failed to load pending teams", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(teamId: string, status: "APPROVED" | "REJECTED") {
    try {
      await adminTeamsService.reviewTeam(teamId, status);
      toast({ title: `Team ${status.toLowerCase()} successfully`, variant: "success" });
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch {
      toast({ title: "Failed to review team", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card">
        <Award className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold">No pending approvals</h3>
        <p className="text-muted-foreground mt-2">All team submissions have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription className="flex flex-col gap-1 mt-2">
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {team.memberCount} / {team.maxSize} Members</span>
              <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Leader: {team.leader.name}</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Created {new Date(team.createdAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            {team.requiredSkills && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-1">Required Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {team.requiredSkills.split(",").map((s, i) => (
                    <span key={i} className="bg-muted text-xs px-2 py-1 rounded-md">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 w-full mt-4">
              <Button className="flex-1 bg-teal text-white hover:bg-teal/90" onClick={() => handleReview(team.id, "APPROVED")}>
                <Check className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleReview(team.id, "REJECTED")}>
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

