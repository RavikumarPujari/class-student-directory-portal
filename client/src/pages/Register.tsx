import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentForm } from "@/components/shared/StudentForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { registerStudent } from "@/services/students.service";
import { getErrorMessage } from "@/services/api";
import { StudentFormSchema } from "@/utils/validation";

export function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(values: StudentFormSchema) {
    setIsSubmitting(true);
    try {
      await registerStudent({
        ...values,
        portfolio: values.portfolio || undefined,
        bio: values.bio || undefined,
      });
      setSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Your profile is now live in the directory.",
        variant: "success",
      });
    } catch (err) {
      toast({ title: "Registration failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md text-center">
            <CardContent className="p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">You're all set!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your profile has been added to the class directory. Classmates can now discover and
                connect with you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={() => navigate("/directory")}>
                  View Directory
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSuccess(false);
                  }}
                >
                  Register Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Student Registration</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in your details once — this becomes your public profile in the class directory.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>All fields marked required must be filled accurately.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
