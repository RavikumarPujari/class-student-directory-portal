import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, Loader2, Send, MessageSquare, Info as InfoIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { teamsService, PopulatedTeam } from "@/services/teams.service";
import { useToast } from "@/hooks/useToast";
import { MatchStudentsModal } from "@/components/teams/MatchStudentsModal";

export function TeamWorkspace() {
  const { teamId } = useParams<{ teamId: string }>();
  const { isStudentAuthenticated, student } = useStudentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [team, setTeam] = useState<PopulatedTeam | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const [newAiQuestion, setNewAiQuestion] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Tabs for mobile (Info, Members, Discussion, Ask AI) and desktop (Discussion, Ask AI)
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'discussion' | 'ask-ai'>('discussion');

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

        const aiData = await teamsService.getTeamAIMessages(teamId!);
        setAiMessages(aiData);
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
    if (activeTab === 'discussion') messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeTab === 'ask-ai') aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const msg = await teamsService.sendTeamMessage(teamId!, newMessage);
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (err: any) {
      toast({ title: "Failed to send message", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAiQuestion.trim() || isAskingAi) return;
    
    setIsAskingAi(true);
    // Optimistically add user's question
    const optimisticQuestion = {
      id: 'temp-' + Date.now(),
      question: newAiQuestion,
      answer: null,
      createdAt: new Date().toISOString(),
      askedByStudentId: student?.id,
      student: { name: student?.name, photo: student?.photo }
    };
    setAiMessages([...aiMessages, optimisticQuestion]);
    setNewAiQuestion("");

    try {
      const msg = await teamsService.askTeamAI(teamId!, optimisticQuestion.question);
      setAiMessages(prev => prev.map(m => m.id === optimisticQuestion.id ? msg : m));
    } catch (err: any) {
      toast({ title: "Failed to get AI answer", description: err.response?.data?.message || err.message, variant: "destructive" });
      setAiMessages(prev => prev.filter(m => m.id !== optimisticQuestion.id)); // remove optimistic
    } finally {
      setIsAskingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const InfoComponent = () => (
    <Card className="border-border bg-card h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{team?.name}</CardTitle>
          {team?.isLeader && <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10">Leader</Badge>}
        </div>
        <CardDescription className="text-muted-foreground mt-2">
          {team?.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {team?.requiredSkills ? (
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
          <span className="font-medium text-foreground">{team?.memberCount} / {team?.maxSize}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-border pt-4">
          <span className="text-muted-foreground">Created</span>
          <span className="font-medium text-foreground">{team && new Date(team.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const MembersComponent = () => (
    <Card className="border-border bg-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team Members</CardTitle>
        {student?.id === team?.leader?.id && (
          <Button size="sm" onClick={() => setMatchModalOpen(true)}>
            Find Students
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team?.members?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">This team has no members yet.</p>
          )}
          {team?.members?.map(member => (
            <div key={member.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={member.photo || undefined} />
                    <AvatarFallback className="bg-muted text-primary">{member.name.charAt(0)}</AvatarFallback>
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
                  Profile
                </Button>
              </div>
              {member.skills && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {member.skills.split(",").map(s => s.trim()).join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const DiscussionComponent = () => (
    <Card className="border-border bg-card h-[70vh] min-h-[500px] max-h-[800px] flex flex-col">
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
          messages.map((msg) => {
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
  );

  const AskAIComponent = () => (
    <Card className="border-border bg-card h-[70vh] min-h-[500px] max-h-[800px] flex flex-col border-gold/30">
      <CardHeader className="border-b border-border pb-4 bg-gradient-to-r from-card to-gold/5">
        <CardTitle className="flex items-center gap-2 text-lg text-gold">
          <Sparkles className="h-5 w-5" />
          Ask AI Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {aiMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Ask me anything about your project — tech choices, how to approach a feature, or debugging help.
            </p>
          </div>
        ) : (
          aiMessages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* Question */}
              <div className="flex justify-end">
                <div className="flex gap-3 max-w-[85%] flex-row-reverse">
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{msg.student?.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words bg-muted text-foreground rounded-tr-none border border-border">
                      {msg.question}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[90%] flex-row">
                  <Avatar className="h-8 w-8 border border-gold/30 flex-shrink-0 mt-1 bg-gold/10">
                    <AvatarFallback className="bg-transparent text-gold"><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-gold">AI Mentor</span>
                      {msg.answer && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words bg-gold/10 text-foreground rounded-tl-none border border-gold/20 leading-relaxed shadow-sm">
                      {msg.answer ? msg.answer : (
                        <span className="flex items-center text-gold/70">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={aiMessagesEndRef} />
      </CardContent>
      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleAskAI} className="flex items-center gap-2">
          <Input
            placeholder="Ask the AI mentor..."
            className="flex-1 bg-card border-gold/30 focus-visible:ring-gold text-foreground h-11"
            value={newAiQuestion}
            onChange={(e) => setNewAiQuestion(e.target.value)}
            disabled={isAskingAi}
            maxLength={1000}
          />
          <Button type="submit" disabled={!newAiQuestion.trim() || isAskingAi} className="bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-navy h-11 px-6 font-bold shadow-md shadow-gold/20 border-0">
            {isAskingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Ask AI</span>
          </Button>
        </form>
      </div>
    </Card>
  );

  return (
    <div className="container max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground group">
          <Link to="/student/teams/directory" className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Directory
          </Link>
        </Button>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Workspace</h1>
      </div>

      {/* Mobile Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 lg:hidden pb-2 scrollbar-hide">
        <Button 
          variant={activeTab === 'info' ? 'default' : 'outline'} 
          className={activeTab === 'info' ? 'bg-teal text-black' : ''}
          onClick={() => setActiveTab('info')}
          size="sm"
        >
          <InfoIcon className="h-4 w-4 mr-2" /> Info
        </Button>
        <Button 
          variant={activeTab === 'members' ? 'default' : 'outline'} 
          className={activeTab === 'members' ? 'bg-teal text-black' : ''}
          onClick={() => setActiveTab('members')}
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" /> Members
        </Button>
        <Button 
          variant={activeTab === 'discussion' ? 'default' : 'outline'} 
          className={activeTab === 'discussion' ? 'bg-teal text-black' : ''}
          onClick={() => setActiveTab('discussion')}
          size="sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" /> Chat
        </Button>
        <Button 
          variant={activeTab === 'ask-ai' ? 'default' : 'outline'} 
          className={activeTab === 'ask-ai' ? 'bg-gold text-black border-gold' : 'border-gold/30 text-gold'}
          onClick={() => setActiveTab('ask-ai')}
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Ask AI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Desktop only: Info & Members) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
          <InfoComponent />
          <MembersComponent />
        </div>

        {/* Right Column (Desktop: Tabs for Discussion/AI | Mobile: Shows active tab) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {/* Desktop Tabs Navigation */}
          <div className="hidden lg:flex gap-2 mb-4">
            <Button 
              variant={activeTab === 'discussion' || activeTab === 'info' || activeTab === 'members' ? 'default' : 'outline'} 
              className={activeTab === 'discussion' || activeTab === 'info' || activeTab === 'members' ? 'bg-teal text-black' : ''}
              onClick={() => setActiveTab('discussion')}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Team Discussion
            </Button>
            <Button 
              variant={activeTab === 'ask-ai' ? 'default' : 'outline'} 
              className={activeTab === 'ask-ai' ? 'bg-gold text-black border-gold' : 'border-gold/30 text-gold'}
              onClick={() => setActiveTab('ask-ai')}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Ask AI Mentor
            </Button>
          </div>

          {/* Render Active Component based on Tab */}
          <div className="lg:hidden">
            {activeTab === 'info' && <InfoComponent />}
            {activeTab === 'members' && <MembersComponent />}
          </div>
          
          <div className={`h-full ${activeTab === 'info' || activeTab === 'members' ? 'hidden lg:block' : ''}`}>
            {activeTab === 'ask-ai' ? <AskAIComponent /> : <DiscussionComponent />}
          </div>
        </div>
      </div>

      {/* Member Profile Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Member Profile</DialogTitle>
                <DialogDescription className="sr-only">Profile details for {selectedMember.name}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6 space-y-4">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={selectedMember.photo || undefined} />
                  <AvatarFallback className="text-3xl bg-muted text-primary">{selectedMember.name.charAt(0)}</AvatarFallback>
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

      {team && (
        <MatchStudentsModal
          open={matchModalOpen}
          onOpenChange={setMatchModalOpen}
          teamId={team.id}
          requiredSkills={team.requiredSkills}
        />
      )}
    </div>
  );
}
