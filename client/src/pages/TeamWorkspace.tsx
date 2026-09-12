import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Shield, Calendar, Loader2, Send, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { useToast } from "@/hooks/useToast";

export function TeamWorkspace() {
 const { teamId } = useParams<{ teamId: string }>();
 const { isStudentAuthenticated, student } = useStudentAuth();
 const navigate = useNavigate();
 const { toast } = useToast();

 const [team, setTeam] = useState<PopulatedTeam | null>(null);
 const [messages, setMessages] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 
 const [newMessage, setNewMessage] = useState("");
 const [isSending, setIsSending] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const [selectedMember, setSelectedMember] = useState<any | null>(null);

 useEffect(() => {
 if (!isStudentAuthenticated) {
 navigate("/student/login");
 return;
 }
 
 if (!teamId) return;

 async function loadWorkspace() {
 try {
 const teamData = await teamsService.getTeam(teamId!);
 setTeam(teamData);
 
 const messagesData = await teamsService.getTeamMessages(teamId!);
 setMessages(messagesData);
 } catch (err: any) {
 toast({ title: "Error accessing workspace", description: err.response?.data?.message || err.message, variant: "destructive" });
 navigate("/student/teams/me");
 } finally {
 setIsLoading(false);
 }
 }

 loadWorkspace();
 }, [teamId, isStudentAuthenticated, navigate]);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newMessage.trim() || !teamId) return;

 setIsSending(true);
 try {
 const sentMsg = await teamsService.sendTeamMessage(teamId, newMessage);
 setMessages(prev => [...prev, sentMsg]);
 setNewMessage("");
 } catch (err: any) {
 toast({ title: "Failed to send message", description: err.response?.data?.message || err.message, variant: "destructive" });
 } finally {
 setIsSending(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex min-h-screen items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-teal" />
 </div>
 );
 }

 if (!team) return null;

 return (
 <div className="container max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-4 mb-8">
 <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground group">
 <Link to="/student/teams/me" className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
 <ArrowLeft className="mr-2 h-4 w-4" />
 My Teams
 </Link>
 </Button>
 <h1 className="text-3xl font-display font-extrabold text-foreground">Team Workspace</h1>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column: Team Details & Members */}
 <div className="lg:col-span-1 space-y-6">
 <Card className="border-border bg-card ">
 <CardHeader>
 <div className="flex justify-between items-start">
 <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
 {team.isLeader && (
 <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10">Leader</Badge>
 )}
 </div>
 <CardDescription className="text-muted-foreground mt-2">
 {team.description || "No description provided."}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <p className="text-sm text-muted-foreground mb-1">Required Skills</p>
 <div className="flex flex-wrap gap-1.5">
 {team.requiredSkills ? (
 team.requiredSkills.split(",").map((s, i) => (
 <Badge key={i} variant="outline" className="bg-muted text-foreground hover:bg-muted">{s.trim()}</Badge>
 ))
 ) : (
 <span className="text-sm text-muted-foreground">None specified</span>
 )}
 </div>
 </div>
 <div className="flex justify-between items-center text-sm border-t border-border pt-4">
 <span className="text-muted-foreground">Members</span>
 <span className="font-medium text-foreground">{team.memberCount} / {team.maxSize}</span>
 </div>
 <div className="flex justify-between items-center text-sm border-t border-border pt-4">
 <span className="text-muted-foreground">Created</span>
 <span className="font-medium text-foreground">{new Date(team.createdAt).toLocaleDateString()}</span>
 </div>
 </CardContent>
 </Card>

 <Card className="border-border bg-card ">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-teal" /> Team Members</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {team.members?.length === 0 && (
 <p className="text-center text-sm text-muted-foreground py-4">This team has no members yet.</p>
 )}
 {team.members?.map(member => (
 <div key={member.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <Avatar className="h-10 w-10 border border-border">
 <AvatarImage src={member.photo || undefined} />
 <AvatarFallback className="bg-muted text-teal">{member.name.charAt(0)}</AvatarFallback>
 </Avatar>
 <div>
 <p className="font-medium text-foreground flex items-center gap-2">
 {member.name}
 {member.id === team.leader.id && <Shield className="h-3 w-3 text-gold" />}
 </p>
 <p className="text-xs text-muted-foreground">{member.branch || "Student"}</p>
 </div>
 </div>
 <Button variant="outline" size="sm" className="h-7 text-xs border-border bg-muted" onClick={() => setSelectedMember(member)}>
 View Profile
 </Button>
 </div>
 {member.skills && (
 <div className="text-xs text-muted-foreground line-clamp-1 pl-13 ml-13">
 {member.skills.split(",").map(s => s.trim()).join(" • ")}
 </div>
 )}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Right Column: Chat */}
 <div className="lg:col-span-2">
 <Card className="border-border bg-card h-[700px] flex flex-col">
 <CardHeader className="border-b border-border pb-4 bg-card">
 <CardTitle className="flex items-center gap-2 text-lg">
 <MessageSquare className="h-5 w-5 text-teal" />
 Team Discussion
 </CardTitle>
 </CardHeader>
 <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
 {messages.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center">
 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
 <MessageSquare className="h-6 w-6 text-muted-foreground" />
 </div>
 <p className="text-muted-foreground text-sm">No messages yet. Start the discussion.</p>
 </div>
 ) : (
 messages.map((msg, i) => {
 const isMe = msg.senderId === student?.id;
 return (
 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
 <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
 {!isMe && (
 <Avatar className="h-8 w-8 border border-border flex-shrink-0 mt-1">
 <AvatarImage src={msg.sender.photo || undefined} />
 <AvatarFallback className="bg-muted text-xs">{msg.sender.name.charAt(0)}</AvatarFallback>
 </Avatar>
 )}
 <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
 <div className="flex items-baseline gap-2 mb-1">
 <span className="text-xs font-medium text-muted-foreground">{isMe ? 'You' : msg.sender.name}</span>
 <span className="text-[10px] text-muted-foreground">
 {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
 </span>
 </div>
 <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-teal text-black rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
 {msg.content}
 </div>
 </div>
 </div>
 </div>
 );
 })
 )}
 <div ref={messagesEndRef} />
 </CardContent>
 <div className="p-4 bg-card border-t border-border">
 <form onSubmit={handleSendMessage} className="flex items-center gap-2">
 <Input
 placeholder="Write a message..."
 className="flex-1 bg-card border-border text-foreground h-11"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 disabled={isSending}
 maxLength={2000}
 />
 <Button type="submit" disabled={!newMessage.trim() || isSending} className="bg-teal hover:bg-teal/90 text-black h-11 px-6">
 {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
 <span className="ml-2 hidden sm:inline">Send</span>
 </Button>
 </form>
 </div>
 </Card>
 </div>
 </div>

 {/* Member Profile Dialog */}
 <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
 <DialogContent className="sm:max-w-md bg-card border-border text-foreground ">
 {selectedMember && (
 <>
 <DialogHeader>
 <DialogTitle>Member Profile</DialogTitle>
 <DialogDescription className="sr-only">Profile details for {selectedMember.name}</DialogDescription>
 </DialogHeader>
 <div className="flex flex-col items-center py-6 space-y-4">
 <Avatar className="h-24 w-24 border-2 border-border">
 <AvatarImage src={selectedMember.photo || undefined} />
 <AvatarFallback className="text-3xl bg-muted text-teal">{selectedMember.name.charAt(0)}</AvatarFallback>
 </Avatar>
 <div className="text-center">
 <h3 className="text-xl font-bold">{selectedMember.name}</h3>
 <p className="text-sm text-muted-foreground">{selectedMember.usn}</p>
 </div>
 
 <div className="w-full space-y-3 pt-4 border-t border-border">
 {selectedMember.email && (
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="text-muted-foreground col-span-1">Email:</span>
 <span className="col-span-2 text-foreground">{selectedMember.email}</span>
 </div>
 )}
 {selectedMember.branch && (
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="text-muted-foreground col-span-1">Branch:</span>
 <span className="col-span-2 text-foreground">{selectedMember.branch}</span>
 </div>
 )}
 {selectedMember.skills && (
 <div className="grid grid-cols-3 gap-2 text-sm">
 <span className="text-muted-foreground col-span-1">Skills:</span>
 <span className="col-span-2 text-foreground">{selectedMember.skills.split(",").map((s:string) => s.trim()).join(" • ")}</span>
 </div>
 )}
 </div>
 </div>
 </>
 )}
 </DialogContent>
 </Dialog>
 </div>
 );
}
