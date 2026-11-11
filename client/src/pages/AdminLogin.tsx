import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back!", description: "Login successful.", variant: "success" });
      navigate("/admin/dashboard");
    } catch (err) {
      toast({ title: "Login failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-12 px-4 bg-[#f3f6fb]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 shadow-xs">
              <ShieldCheck className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold font-display tracking-tight text-slate-900">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1">
              Sign in to manage the student directory and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@classportal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Sign In as Admin <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
export default AdminLogin;
