import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Rocket, Users, Bell, Mail, BookOpen, ChevronRight, Edit3, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentForm } from "@/components/shared/StudentForm";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useToast } from "@/hooks/useToast";
import { updateMyStudentProfile, deleteMyStudentProfile } from "@/services/students.service";
import { teamsService } from "@/services/teams.service";
import { getErrorMessage } from "@/services/api";
import { StudentFormSchema } from "@/utils/validation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

export function StudentProfile() {
  const { student, isStudentAuthenticated, studentLogout, refreshStudentProfile } = useStudentAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "edit">("dashboard");
  
  // Team states
  const [teams, setTeams] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isStudentAuthenticated) {
      navigate("/student/login");
    } else {
      fetchTeamData();
    }
  }, [isStudentAuthenticated, navigate]);

  const fetchTeamData = async () => {
    try {
      const [myTeams, myInvites] = await Promise.all([
        teamsService.getMyTeams(),
        teamsService.getMyInvitations()
      ]);
      setTeams(myTeams);
      setInvitations(myInvites);
    } catch (err) {
      console.error("Failed to load team data", err);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  if (!student) return null;

  async function handleUpdate(values: StudentFormSchema) {
    setIsUpdating(true);
    try {
      await updateMyStudentProfile(values);
      await refreshStudentProfile();
      toast({ title: "Profile updated", description: "Changes saved.", variant: "success" });
      setActiveView("dashboard");
    } catch (err) {
      toast({ title: "Update failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMyStudentProfile();
      toast({ title: "Account Deleted", description: "Your account was permanently removed.", variant: "success" });
      studentLogout();
      navigate("/");
    } catch (err) {
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
      setIsDeleting(false);
    }
  }

  function handleLogout() {
    studentLogout();
    toast({ title: "Signed out", description: "Logged out successfully." });
    navigate("/");
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* TOP / WELCOME SECTION */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="font-display text-3xl font-extrabold text-white flex items-center gap-3">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            {student.name.split(" ")[0]} <span className="inline-block hover:-rotate-12 transition-transform origin-bottom-right cursor-default">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md">Welcome back! Here's your student portal overview.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto mt-2 md:mt-0">
          <Button variant="outline" className="flex-1 md:flex-none border-white/10 bg-white/5 hover:bg-white/10 text-white" onClick={() => setActiveView(activeView === "dashboard" ? "edit" : "dashboard")}>
            {activeView === "dashboard" ? <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</> : <><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</>}
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {activeView === "edit" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader className="py-4">
              <div className="flex items-center gap-4">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="h-12 w-12 rounded-xl border border-white/10 object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <CardDescription>{student.usn}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StudentForm defaultValues={student} onSubmit={handleUpdate} submitLabel="Save" isSubmitting={isUpdating} lockPermanentFields />
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Permanent Deletion</DialogTitle>
                  <DialogDescription>
                    This action is irreversible. It will permanently delete your account and all associated data from the database.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
          
          {/* QUICK STATISTICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile</p>
                  <p className="font-display text-xl font-bold text-white">Complete</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Team</p>
                  <p className="font-display text-xl font-bold text-white">
                    {isLoadingTeams ? <Loader2 className="h-5 w-5 animate-spin text-teal" /> : teams.length > 0 ? `${teams[0].memberCount} / ${teams[0].maxSize}` : "None"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Invitations</p>
                  <p className="font-display text-xl font-bold text-white">
                    {isLoadingTeams ? <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> : `${invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length} Pending`}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skills</p>
                  <p className="font-display text-xl font-bold text-white">
                    {student.skills ? student.skills.split(',').length : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: PROFILE & SKILLS */}
            <div className="flex flex-col gap-6">
              {/* PROFILE CARD */}
              <Card className="border-white/10 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-white/40" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{student.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-teal mt-1">{student.usn}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="text-sm font-medium text-white">{student.branch}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-sm text-muted-foreground">Domain</span>
                    <span className="text-sm font-medium text-white">{student.favoriteDomain}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-sm text-muted-foreground">Year</span>
                    <span className="text-sm font-medium text-white">{student.year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Section</span>
                    <span className="text-sm font-medium text-white">{student.section}</span>
                  </div>
                </CardContent>
              </Card>

              {/* SKILLS CARD */}
              <Card className="border-white/10 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Your Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {student.skills ? (
                    <div className="flex flex-col gap-2">
                      {student.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm text-white font-medium flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal shrink-0"></span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No skills listed yet.</p>
                  )}
                </CardContent>
                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => setActiveView("edit")}>
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: TEAM & INVITATIONS */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              {/* TEAM CARD */}
              <Card className="border-white/10 bg-black/40 backdrop-blur-md flex-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal" /> My Team
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTeams ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
                  ) : teams.length > 0 ? (
                    <div className="space-y-4">
                      {teams.map(team => (
                        <div key={team.id} className="bg-white/[0.03] p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white text-lg flex items-center gap-2">
                              {team.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{team.description || "No description provided."}</p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Members: <span className="font-medium text-white">{team.memberCount} / {team.maxSize}</span></span>
                            </div>
                          </div>
                          {team.leaderId === student.id ? (
                            <Button variant="default" size="sm" asChild className="shrink-0 bg-gold hover:bg-gold/90 text-black font-semibold w-full sm:w-auto shadow-glow-gold">
                              <Link to="/student/teams/me">Manage Team</Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" asChild className="shrink-0 border-teal/30 text-teal hover:bg-teal/10 hover:text-teal w-full sm:w-auto">
                              <Link to="/student/teams/me">View Team</Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8 bg-white/[0.02] border border-white/5 rounded-xl border-dashed">
                      <Rocket className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-base font-medium text-white mb-1">You haven't joined a team yet.</p>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm">Create your own team or wait for an invitation from team leaders.</p>
                      <Button variant="default" asChild className="bg-teal hover:bg-teal/90 text-black font-semibold">
                        <Link to="/student/teams/create">Create Team</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* INVITATION CARD */}
              <Card className="border-white/10 bg-black/40 backdrop-blur-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-indigo-400" /> Pending Invitations
                    </span>
                    {!isLoadingTeams && invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length > 0 && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
                        {invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length} New
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTeams ? (
                    <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
                  ) : (() => {
                    const pending = invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date());
                    if (pending.length > 0) {
                      return (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2.5 rounded-lg shrink-0"><Bell className="h-5 w-5 text-indigo-400" /></div>
                            <div>
                              <p className="text-sm font-medium text-white">You have {pending.length} pending team invitation{pending.length !== 1 ? 's' : ''}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Review and accept to join a team.</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild className="shrink-0 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 w-full sm:w-auto">
                            <Link to="/student/invitations">View Invitations</Link>
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <Bell className="h-10 w-10 text-muted-foreground/20 mb-3" />
                        <p className="text-sm text-muted-foreground">No pending invitations</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <Link to="/directory" className="block outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl">
                <Card className="flex flex-col items-center justify-center gap-3 border-white/10 bg-black/40 backdrop-blur-sm p-5 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full cursor-pointer">
                  <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 group-hover:bg-gold/20 transition-all">
                    <BookOpen className="h-6 w-6 text-gold" />
                  </div>
                  <span className="text-sm font-medium text-white">Directory</span>
                </Card>
              </Link>
              <Link to="/student/teams/create" className="block outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-xl">
                <Card className="flex flex-col items-center justify-center gap-3 border-white/10 bg-black/40 backdrop-blur-sm p-5 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full cursor-pointer">
                  <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 group-hover:bg-teal/20 transition-all">
                    <Rocket className="h-6 w-6 text-teal" />
                  </div>
                  <span className="text-sm font-medium text-white">Create Team</span>
                </Card>
              </Link>
              <Link to="/student/teams/me" className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl">
                <Card className="flex flex-col items-center justify-center gap-3 border-white/10 bg-black/40 backdrop-blur-sm p-5 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full cursor-pointer">
                  <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">My Team</span>
                </Card>
              </Link>
              <Link to="/student/invitations" className="block outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl">
                <Card className="flex flex-col items-center justify-center gap-3 border-white/10 bg-black/40 backdrop-blur-sm p-5 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full relative overflow-hidden cursor-pointer">
                  {invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length > 0 && (
                    <div className="absolute top-0 right-0 h-12 w-12 bg-indigo-500/20 blur-xl"></div>
                  )}
                  <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all relative">
                    {invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full border-2 border-background animate-pulse" />
                    )}
                    <Bell className="h-6 w-6 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Invitations</span>
                </Card>
              </Link>
              <button onClick={() => setActiveView("edit")} className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-xl">
                <Card className="flex flex-col items-center justify-center gap-3 border-white/10 bg-black/40 backdrop-blur-sm p-5 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full cursor-pointer">
                  <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                    <User className="h-6 w-6 text-rose-400" />
                  </div>
                  <span className="text-sm font-medium text-white">My Profile</span>
                </Card>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
