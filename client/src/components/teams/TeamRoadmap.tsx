import { useState } from "react";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { teamsService } from "@/services/teams.service";

interface TeamRoadmapProps {
  teamId: string;
  initialRoadmap: any;
}

export function TeamRoadmap({ teamId, initialRoadmap }: TeamRoadmapProps) {
  const [roadmap, setRoadmap] = useState<any>(initialRoadmap);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const data = await teamsService.generateTeamRoadmap(teamId);
      setRoadmap(data);
      toast({
        title: "Success",
        description: "AI Roadmap generated successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Couldn't generate a roadmap right now — try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal" /> AI Project Roadmap
          </h4>
          <p className="text-xs text-muted-foreground mt-1">Generated specifically for your team's skills and goals.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          variant={roadmap ? "outline" : "default"}
          size="sm"
          className={!roadmap ? "bg-gradient-to-r from-teal to-gold hover:from-teal/90 hover:to-gold/90 text-black font-semibold border-0" : ""}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : roadmap ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 text-teal" /> Regenerate
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate AI Roadmap
            </>
          )}
        </Button>
      </div>

      {roadmap && roadmap.phases && (
        <div className="relative border-l-2 border-border ml-3 pl-6 space-y-8">
          {roadmap.phases.map((phase: any, index: number) => (
            <div key={index} className="relative">
              <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-gold bg-background"></div>
              <h5 className="text-base font-bold text-gold mb-1">{phase.title}</h5>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium bg-muted w-fit px-2 py-1 rounded">
                <Calendar className="h-3 w-3" /> {phase.durationWeeks} Weeks
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{phase.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

