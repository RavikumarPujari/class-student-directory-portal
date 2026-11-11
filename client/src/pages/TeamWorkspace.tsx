import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, Loader2, Send, MessageSquare, Info as InfoIcon, Sparkles, CheckCheck, Trash2 } from "lucide-react";
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

  const handleClearChat = async () => {
    if (!team || team.leaderId !== student?.id) return;
    if (!confirm("Are you sure you want to clear all chat messages for this team?")) return;
    try {
      await teamsService.clearTeamMessages(team.id);
      setMessages([]);
      toast({ title: "Chat cleared", description: "All messages have been deleted." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const handleUnsendMessage = async (messageId: string) => {
    if (!team) return;
    if (!confirm("Unsend this message?")) return;
    try {
      await teamsService.unsendTeamMessage(team.id, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const msg = await teamsService.sendTeamMessage(team!.id, newMessage);
      setMessages(prev => [...prev, msg]);
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
    try {
      const aiResponse = await teamsService.askTeamAI(team!.id, newAiQuestion);
      setAiMessages(prev => [...prev, aiResponse]);
      setNewAiQuestion("");
    } catch (err: any) {
      toast({ title: "AI Mentor Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setIsAskingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderInfo = () => (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs h-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold text-slate-900 font-display">{team?.name}</CardTitle>
          {team?.isLeader && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
              <Shield className="mr-1 h-3 w-3 text-amber-600" /> Leader
            </span>
          )}
        </div>
        <CardDescription className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          {team?.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-xs">
        <div>
          <p className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1.5">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {team?.requiredSkills ? (
              team.requiredSkills.split(",").map((s, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {s.trim()}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">None specified</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
          <span className="text-slate-500">Members Capacity</span>
          <span className="font-semibold text-slate-800">{team?.memberCount} / {team?.maxSize}</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
          <span className="text-slate-500">Created Date</span>
          <span className="font-medium text-slate-800">{team && new Date(team.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderMembers = () => (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" /> Team Members
        </CardTitle>
        {student?.id === team?.leader?.id && (
          <Button 
            size="sm" 
            onClick={() => setMatchModalOpen(true)}
            className="h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
          >
            Find Students
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {team?.members?.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">This team has no additional members yet.</p>
          )}
          {team?.members?.map(member => (
            <div key={member.id} className="flex flex-col gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 border border-slate-200 shadow-2xs">
                    <AvatarImage src={member.photo || undefined} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      {member.name}
                      {member.id === team.leader.id && <Shield className="h-3 w-3 text-amber-500" />}
                    </p>
                    <p className="text-[11px] text-slate-500">{member.branch || "Student"}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-[11px] rounded-lg border-slate-200 text-slate-700 hover:bg-white" 
                  onClick={() => setSelectedMember(member)}
                >
                  Profile
                </Button>
              </div>
              {member.skills && (
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {member.skills.split(",").map(s => s.trim()).join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDiscussion = () => (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs h-[72vh] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-3.5 px-5 bg-white flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          Team Discussion
        </CardTitle>
        {team?.leaderId === student?.id && messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="h-7 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg gap-1"
          >
            <Trash2 className="h-3 w-3" /> Clear Chat
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">No messages yet</p>
            <p className="text-slate-400 text-xs mt-1">Start collaborating with your teammates in real-time.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === student?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 border border-slate-200 flex-shrink-0 mt-1">
                      <AvatarImage src={msg.sender.photo || undefined} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">{msg.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[11px] font-semibold text-slate-600">{isMe ? 'You' : msg.sender.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex flex-col group relative">
                      <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed shadow-2xs ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                      }`}>
                        {msg.content}
                      </div>
                      {isMe && (
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-[10px] text-indigo-600 flex items-center font-medium">
                            <CheckCheck className="h-3 w-3 mr-0.5" /> Delivered
                          </span>
                          <button 
                            onClick={() => handleUnsendMessage(msg.id)} 
                            className="text-[10px] text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Unsend
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-3.5 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="Write a message to teammates..."
            className="flex-1 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 h-10"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            maxLength={2000}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isSending} 
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 font-semibold text-xs shadow-xs"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );

  const renderAskAI = () => (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs h-[72vh] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-3.5 px-5 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <div>
            <CardTitle className="text-base font-bold text-slate-900">AI Team Mentor</CardTitle>
            <CardDescription className="text-slate-500 text-[11px]">
              Ask technical questions, brainstorm architectures, or plan milestone tasks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
        {aiMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">Need help with your project?</p>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Ask your AI mentor for code architecture tips, VTU project guidelines, or team task allocation ideas.
            </p>
          </div>
        ) : (
          aiMessages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {/* Question */}
              <div className="flex justify-end">
                <div className="flex flex-col items-end max-w-[85%]">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold text-slate-600">{msg.student?.name || 'You'}</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-indigo-600 text-white rounded-tr-none shadow-2xs leading-relaxed">
                    {msg.question}
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[90%]">
                  <Avatar className="h-7 w-7 border border-amber-200 bg-amber-50 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-transparent text-amber-600"><Sparkles className="h-3.5 w-3.5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-amber-700">AI Mentor</span>
                      {msg.answer && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-3 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap break-words bg-amber-50/70 text-slate-800 rounded-tl-none border border-amber-200/70 leading-relaxed shadow-2xs">
                      {msg.answer ? msg.answer : (
                        <span className="flex items-center text-amber-700">
                          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Thinking...
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
      <div className="p-3.5 bg-white border-t border-slate-100">
        <form onSubmit={handleAskAI} className="flex items-center gap-2">
          <Input
            placeholder="Ask the AI mentor anything about your project..."
            className="flex-1 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 h-10"
            value={newAiQuestion}
            onChange={(e) => setNewAiQuestion(e.target.value)}
            disabled={isAskingAi}
            maxLength={1000}
          />
          <Button 
            type="submit" 
            disabled={!newAiQuestion.trim() || isAskingAi} 
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white h-10 px-5 font-semibold text-xs shadow-xs"
          >
            {isAskingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">Ask AI</span>
          </Button>
        </form>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                {team?.name || "Team Workspace"}
              </h1>
              <p className="text-sm text-slate-500">
                Collaborative team hub, live discussion, and AI guidance
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button variant="outline" asChild size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
            <Link to="/student/teams/me" className="flex items-center">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> My Teams
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 lg:hidden pb-1">
        <Button 
          variant={activeTab === 'info' ? 'default' : 'outline'} 
          className={activeTab === 'info' ? 'bg-indigo-600 text-white' : 'border-slate-200 text-slate-700'}
          onClick={() => setActiveTab('info')}
          size="sm"
        >
          <InfoIcon className="h-3.5 w-3.5 mr-1.5" /> Info
        </Button>
        <Button 
          variant={activeTab === 'members' ? 'default' : 'outline'} 
          className={activeTab === 'members' ? 'bg-indigo-600 text-white' : 'border-slate-200 text-slate-700'}
          onClick={() => setActiveTab('members')}
          size="sm"
        >
          <Users className="h-3.5 w-3.5 mr-1.5" /> Members
        </Button>
        <Button 
          variant={activeTab === 'discussion' ? 'default' : 'outline'} 
          className={activeTab === 'discussion' ? 'bg-indigo-600 text-white' : 'border-slate-200 text-slate-700'}
          onClick={() => setActiveTab('discussion')}
          size="sm"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat
        </Button>
        <Button 
          variant={activeTab === 'ask-ai' ? 'default' : 'outline'} 
          className={activeTab === 'ask-ai' ? 'bg-amber-500 text-white' : 'border-amber-200 text-amber-700'}
          onClick={() => setActiveTab('ask-ai')}
          size="sm"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Ask AI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Desktop: Info & Members) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
          {renderInfo()}
          {renderMembers()}
        </div>

        {/* Right Column (Desktop: Tabs for Discussion/AI | Mobile: Active tab) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {/* Desktop Tabs Navigation */}
          <div className="hidden lg:flex gap-2 mb-3">
            <Button 
              variant={activeTab === 'discussion' || activeTab === 'info' || activeTab === 'members' ? 'default' : 'outline'} 
              className={activeTab === 'discussion' || activeTab === 'info' || activeTab === 'members' 
                ? 'bg-indigo-600 text-white rounded-xl font-semibold text-xs' 
                : 'rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold'
              }
              onClick={() => setActiveTab('discussion')}
              size="sm"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Team Discussion
            </Button>
            <Button 
              variant={activeTab === 'ask-ai' ? 'default' : 'outline'} 
              className={activeTab === 'ask-ai' 
                ? 'bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-xs' 
                : 'rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold'
              }
              onClick={() => setActiveTab('ask-ai')}
              size="sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Ask AI Mentor
            </Button>
          </div>

          {/* Render Active Component based on Tab */}
          <div className="lg:hidden">
            {activeTab === 'info' && renderInfo()}
            {activeTab === 'members' && renderMembers()}
          </div>
          
          <div className={`h-full ${activeTab === 'info' || activeTab === 'members' ? 'hidden lg:block' : ''}`}>
            {activeTab === 'ask-ai' ? renderAskAI() : renderDiscussion()}
          </div>
        </div>
      </div>

      {/* Member Profile Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 rounded-2xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-lg">Member Profile</DialogTitle>
                <DialogDescription className="sr-only">Profile details for {selectedMember.name}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-4 space-y-3">
                <Avatar className="h-20 w-20 border-2 border-slate-200 shadow-xs">
                  <AvatarImage src={selectedMember.photo || undefined} />
                  <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700 font-bold">{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedMember.usn}</p>
                </div>
                
                <div className="w-full space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                  {selectedMember.email && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 col-span-1">Email:</span>
                      <span className="col-span-2 font-medium text-slate-800">{selectedMember.email}</span>
                    </div>
                  )}
                  {selectedMember.branch && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 col-span-1">Branch:</span>
                      <span className="col-span-2 font-medium text-slate-800">{selectedMember.branch}</span>
                    </div>
                  )}
                  {selectedMember.skills && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 col-span-1">Skills:</span>
                      <span className="col-span-2 font-medium text-slate-800">{selectedMember.skills.split(",").map((s:string) => s.trim()).join(" • ")}</span>
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
export default TeamWorkspace;
