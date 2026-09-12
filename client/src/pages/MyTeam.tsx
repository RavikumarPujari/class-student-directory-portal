import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, User, Shield, Calendar, Loader2, Info, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { InviteStudentsModal } from "@/components/teams/InviteStudentsModal";

export function MyTeam() {
 const { isStudentAuthenticated, student } = useStudentAuth();
 const navigate = useNavigate();
 
 const [teams, setTeams] = useState<PopulatedTeam[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [inviteModalOpen, setInviteModalOpen] = useState(false);
 const [activeTeamForInvite, setActiveTeamForInvite] = useState<PopulatedTeam | null>(null);

 const handleOpenInvite = (team: PopulatedTeam) => {
 setActiveTeamForInvite(team);
 setInviteModalOpen(true);
 };

 useEffect(() => {
 if (!isStudentAuthenticated) {
 navigate("/student/login");
 return;
 }
 
 async function fetchTeams() {
 try {
 const myTeams = await teamsService.getMyTeams();
 setTeams(myTeams);
 } catch (err) {
 console.error("Failed to fetch teams", err);
 } finally {
 setIsLoading(false);
 }
 }
 
 fetchTeams();
 }, [isStudentAuthenticated, navigate]);

 if (isLoading) {
 return (
 <div className="flex min-h-screen items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-teal" />
 </div>
 );
 }

 return (
 <div className="container max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
 <div className="flex items-center gap-4">
 <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground group">
 <Link to="/student/profile" className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
 <ArrowLeft className="mr-2 h-4 w-4" />
 Dashboard
 </Link>
 </Button>
 <h1 className="text-3xl font-display font-extrabold text-foreground">My Teams</h1>
 </div>
 <Button asChild className="bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm">
 <Link to="/student/teams/create"><UserPlus className="mr-2 h-4 w-4" /> Create New Team</Link>
 </Button>
 </div>

 {teams.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-2xl border border-border"
 >
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
 <div className="space-y-8">
 {teams.map((team, idx) => (
 <motion.div
 key={team.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 >
 <Card className="border-border bg-card overflow-hidden relative">
 <div className="absolute top-0 left-0 w-1.5 h-full bg-teal"></div>
 
 <CardHeader className="pb-4 border-b border-border bg-card">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <CardTitle className="text-2xl font-bold text-foreground">{team.name}</CardTitle>
 {team.isLeader && (
 <span className="inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/30">
 <Shield className="mr-1.5 h-3 w-3" /> Leader
 </span>
 )}
 </div>
 <CardDescription className="flex items-center gap-2 text-muted-foreground">
 <Calendar className="h-3.5 w-3.5" />
 Created {new Date(team.createdAt).toLocaleDateString()}
 </CardDescription>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <Button asChild variant="outline" className="border-border bg-muted hover:bg-muted text-foreground">
 <Link to={`/student/teams/${team.id}`}>
 <Info className="mr-2 h-4 w-4" /> View Full Details
 </Link>
 </Button>
 {team.isLeader && (
 <Button 
 className="bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm" 
 onClick={() => handleOpenInvite(team)}
 disabled={team.memberCount >= team.maxSize}
 >
 <UserPlus className="mr-2 h-4 w-4" />
 Invite Students
 </Button>
 )}
 </div>
 </div>
 </CardHeader>

 <CardContent className="p-0">
 <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
 
 {/* Left Column: Details & Capacity */}
 <div className="p-6 md:p-8 flex flex-col space-y-8">
 {team.description && (
 <div>
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About Team</h4>
 <p className="text-sm text-gray-300 leading-relaxed">{team.description}</p>
 </div>
 )}

 <div>
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Required Skills</h4>
 {team.requiredSkills ? (
 <div className="flex flex-wrap gap-2">
 {team.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
 <span key={s} className="bg-teal/10 border border-teal/20 text-teal text-xs font-medium px-2.5 py-1 rounded-md">
 {s}
 </span>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground italic">Add required skills to find better team matches.</p>
 )}
 </div>
 
 <div className="mt-auto pt-8">
 <div className="flex justify-between items-end mb-2">
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</h4>
 <span className="text-sm font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-md">
 {team.memberCount} / {team.maxSize} Members
 </span>
 </div>
 <div className="w-full bg-muted rounded-full h-2.5 border border-border overflow-hidden">
 <div 
 className="bg-teal h-full transition-all" 
 style={{ width: `${Math.min(100, (team.memberCount / team.maxSize) * 100)}%` }}
 />
 </div>
 </div>
 </div>

 {/* Right Column: Members List */}
 <div className="p-6 md:p-8 lg:col-span-2 bg-card">
 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
 <Users className="h-4 w-4" /> Team Roster
 </h4>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Leader First */}
 <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
 <div className="h-12 w-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
 {team.leader.photo ? (
 <img src={team.leader.photo} alt={team.leader.name} className="h-full w-full object-cover rounded-xl" />
 ) : (
 <User className="h-5 w-5 text-gold" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground truncate flex items-center gap-2">
 {team.leader.name}
 <span className="bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Leader</span>
 </p>
 <p className="text-xs text-muted-foreground truncate">{team.leader.branch} • {team.leader.usn}</p>
 </div>
 </div>

 {/* Other Members */}
 {team.members?.filter(m => m.id !== team.leader.id).length === 0 ? (
 <div className="flex items-center justify-center p-3 rounded-xl border border-dashed border-border bg-card">
 <p className="text-sm text-muted-foreground italic">No additional members yet.</p>
 </div>
 ) : (
 team.members?.filter(m => m.id !== team.leader.id).map(member => (
 <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
 <div className="h-12 w-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
 {member.photo ? (
 <img src={member.photo} alt={member.name} className="h-full w-full object-cover rounded-xl" />
 ) : (
 <User className="h-5 w-5 text-teal" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground truncate flex items-center gap-2">
 {member.name}
 <span className="bg-muted text-gray-300 border border-border text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Member</span>
 </p>
 <p className="text-xs text-muted-foreground truncate">{member.branch} • {member.usn}</p>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
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
 </div>
 );
}
