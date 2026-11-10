import re

with open("client/src/pages/TeamWorkspace.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add lucide icons
if "Trash2" not in content and "lucide-react" in content:
    content = content.replace('import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, Sparkles } from "lucide-react";', 
                              'import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, CheckCheck, Trash2, Sparkles } from "lucide-react";')

# 2. Add methods
methods = """
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
"""
if "handleClearChat" not in content:
    content = content.replace("const handleSendMessage = async (e: React.FormEvent) => {", methods + "\n  const handleSendMessage = async (e: React.FormEvent) => {")


# 3. Add Clear Chat button to CardTitle
if "Clear Chat" not in content:
    header_orig = """<CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-teal" />
            Team Discussion
          </CardTitle>"""
    header_new = """<CardTitle className="flex items-center justify-between w-full text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal" />
              Team Discussion
            </div>
            {team?.leaderId === student?.id && (
              <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear Chat
              </Button>
            )}
          </CardTitle>"""
    content = content.replace(header_orig, header_new)

# 4. Add unsend and read receipts to message bubble
if "Unsend" not in content:
    bubble_orig = """<div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-teal text-black rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
                        {msg.content}
                      </div>"""
    bubble_new = """<div className="flex flex-col group relative">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-teal text-black rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
                          {msg.content}
                        </div>
                        {isMe && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-[10px] text-teal flex items-center">
                              <CheckCheck className="h-3 w-3 mr-0.5" /> Delivered
                            </span>
                            <button onClick={() => handleUnsendMessage(msg.id)} className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              Unsend
                            </button>
                          </div>
                        )}
                      </div>"""
    content = content.replace(bubble_orig, bubble_new)

with open("client/src/pages/TeamWorkspace.tsx", "w", encoding="utf-8") as f:
    f.write(content)

