import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  GraduationCap,
  Save,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Info
} from "lucide-react";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export function Settings() {
  const { student, isStudentAuthenticated, studentLogout } = useStudentAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Settings state (persisted to localStorage)
  const [emailInvites, setEmailInvites] = useState(() => {
    return localStorage.getItem("setting_email_invites") !== "false";
  });
  const [teamUpdates, setTeamUpdates] = useState(() => {
    return localStorage.getItem("setting_team_updates") !== "false";
  });
  const [digestEmail, setDigestEmail] = useState(() => {
    return localStorage.getItem("setting_digest_email") === "true";
  });

  const handleSavePreferences = () => {
    localStorage.setItem("setting_email_invites", String(emailInvites));
    localStorage.setItem("setting_team_updates", String(teamUpdates));
    localStorage.setItem("setting_digest_email", String(digestEmail));

    toast({
      title: "Preferences Saved",
      description: "Your notification and portal settings have been updated.",
      variant: "success",
    });
  };

  const handleLogout = () => {
    studentLogout();
    navigate("/student/login");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Portal Settings
              </h1>
              <p className="text-sm text-slate-500">
                Manage your account profile, notification preferences, and portal appearance
              </p>
            </div>
          </div>
        </div>

        {isStudentAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="self-start sm:self-auto gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Account Profile Snapshot */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-indigo-600" />
              Account Profile
            </h2>

            {isStudentAuthenticated && student ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-lg font-bold text-white shadow-sm">
                    {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">USN:</span>
                    <span className="font-mono font-medium text-slate-800">{student.usn}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-800">{student.branch || "CSE"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Section:</span>
                    <span className="font-medium text-slate-800">{student.section || "A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Status:</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Active Student
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full text-xs gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    <Link to="/student/profile">
                      Edit Full Profile
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">
                <p>Not signed in as a student.</p>
                <Button asChild size="sm" className="mt-3 bg-indigo-600 text-white">
                  <Link to="/student/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-xs text-indigo-950">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-indigo-900">Need to change your USN?</p>
                <p className="text-indigo-800/80 leading-relaxed">
                  USNs are uniquely verified university identifiers. Please reach out to your college department administrator for identity corrections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Notifications */}
        <div className="space-y-6 lg:col-span-2">
          {/* Email & Notification Settings */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Choose what notifications and email alerts you would like to receive.
            </p>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-slate-800">
                    Team Invitations
                  </label>
                  <p className="text-xs text-slate-500">
                    Receive styled HTML emails whenever a team leader invites you to collaborate.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailInvites}
                  onChange={(e) => setEmailInvites(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-slate-800">
                    Team Workspace Updates
                  </label>
                  <p className="text-xs text-slate-500">
                    Get in-app and email alerts when teammates join or milestone roadmaps are updated.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={teamUpdates}
                  onChange={(e) => setTeamUpdates(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-slate-800">
                    Weekly Digest
                  </label>
                  <p className="text-xs text-slate-500">
                    Summary of new classmate registrations, popular projects, and open team recruitment.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={digestEmail}
                  onChange={(e) => setDigestEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={handleSavePreferences}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs font-semibold px-5"
              >
                <Save className="h-3.5 w-3.5" />
                Save Preferences
              </Button>
            </div>
          </div>

          {/* Appearance & Portal Theme */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-indigo-600" />
              Theme & Appearance
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              The portal is optimized with the official enterprise VTU light theme design.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border-2 border-indigo-600 bg-indigo-50/30 p-4 relative cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900">Enterprise Light (Active)</span>
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                  <div className="w-1/4 bg-[#0b1329]" />
                  <div className="w-3/4 bg-[#f3f6fb] p-1.5 flex flex-col gap-1">
                    <div className="h-2 w-1/2 bg-indigo-400 rounded-xs" />
                    <div className="h-2 w-3/4 bg-white rounded-xs border border-slate-200" />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Matches reference dashboard with navy sidebar and soft canvas.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 opacity-70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">High Contrast</span>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Default</span>
                </div>
                <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                  <div className="w-1/4 bg-slate-900" />
                  <div className="w-3/4 bg-white p-1.5 flex flex-col gap-1">
                    <div className="h-2 w-1/2 bg-slate-700 rounded-xs" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded-xs" />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Standard crisp accessibility contrast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Settings;

