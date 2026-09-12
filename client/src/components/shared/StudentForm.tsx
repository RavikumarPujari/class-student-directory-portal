import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Upload, User } from "lucide-react";
import { useState, ChangeEvent } from "react";
import { checkEmailExists } from "@/services/students.service";
import {
 studentSchema,
 registerSchema,
 StudentFormSchema,
 DOMAIN_OPTIONS,
 SECTION_OPTIONS,
 BRANCH_OPTIONS,
 YEAR_OPTIONS,
 SEMESTER_OPTIONS,
} from "@/utils/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/types";

interface StudentFormProps {
 defaultValues?: Partial<Student>;
 onSubmit: (values: StudentFormSchema) => Promise<void>;
 submitLabel?: string;
 isSubmitting?: boolean;
 /** When true, USN and Email become read-only (permanent identifiers). */
 lockPermanentFields?: boolean;
 /** When true, hides optional profile fields for a streamlined registration process. */
 isRegistration?: boolean;
}

const fieldVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: (i: number) => ({
 opacity: 1,
 y: 0,
 transition: { delay: i * 0.04, duration: 0.35 },
 }),
};

export function StudentForm({
 defaultValues,
 onSubmit,
 submitLabel = "Submit Registration",
 isSubmitting = false,
 lockPermanentFields = false,
 isRegistration = false,
}: StudentFormProps) {
 const [photoPreview, setPhotoPreview] = useState<string | null>(defaultValues?.photo || null);
 const [emailCheckLoading, setEmailCheckLoading] = useState(false);
 const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 setValue,
 watch,
 formState: { errors },
 } = useForm<any>({
 resolver: zodResolver(lockPermanentFields ? studentSchema : registerSchema),
defaultValues: {
 name: defaultValues?.name || "",
 usn: defaultValues?.usn || "",
 section: defaultValues?.section || "",
 branch: defaultValues?.branch || "",
 year: defaultValues?.year || "",
 semester: defaultValues?.semester || 1,
 phone: defaultValues?.phone || "",
 email: defaultValues?.email || "",
 linkedin: defaultValues?.linkedin || "",
 github: defaultValues?.github || "",
 portfolio: defaultValues?.portfolio || "",
 favoriteDomain: defaultValues?.favoriteDomain || "",
 skills: defaultValues?.skills || "",
 bio: defaultValues?.bio || "",
 photo: defaultValues?.photo || "",
 password: "",
 },
 });

 const section = watch("section");
 const favoriteDomain = watch("favoriteDomain");
 const branch = watch("branch");
 const year = watch("year");
 const semester = watch("semester");

 function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0];
 if (!file) return;
 if (file.size > 1.5 * 1024 * 1024) {
 alert("Please choose an image under 1.5MB.");
 return;
 }
 const reader = new FileReader();
 reader.onload = () => {
 const result = reader.result as string;
 setPhotoPreview(result);
 setValue("photo", result);
 };
 reader.readAsDataURL(file);
 }

 const fields = [
 { name: "name" as const, label: "Full Name", placeholder: "e.g. Ravikumar S" },
 { name: "usn" as const, label: "USN", placeholder: "e.g. 1XX23CS045" },
 { name: "phone" as const, label: "Phone Number", placeholder: "e.g. 9876543210" },
 { name: "email" as const, label: "Email Address", placeholder: "you@example.com" },
 { name: "linkedin" as const, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
 { name: "github" as const, label: "GitHub URL", placeholder: "https://github.com/username" },
 { name: "portfolio" as const, label: "Portfolio URL (optional)", placeholder: "https://yourportfolio.com" },
 { name: "skills" as const, label: "Skills (comma separated)", placeholder: "React, Python, SQL" },
 ];

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 {!isRegistration && (
 <motion.div
 custom={0}
 initial="hidden"
 animate="visible"
 variants={fieldVariants}
 className="flex items-center gap-5"
 >
 <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card">
 {photoPreview ? (
 <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
 ) : (
 <User className="h-8 w-8 text-muted-foreground" />
 )}
 </div>
 <div>
 <Label htmlFor="photo" className="mb-2 block">
 Profile Photo (optional)
 </Label>
 <label
 htmlFor="photo"
 className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-gold/30 hover:text-foreground"
 >
 <Upload className="h-3.5 w-3.5" />
 Upload image
 </label>
 <input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
 </div>
 </motion.div>
 )}

 <div className="grid gap-5 sm:grid-cols-2">
 {fields.slice(0, 2).map((f, i) => (
 <motion.div key={f.name} custom={i + 1} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label htmlFor={f.name} className="mb-2 block">
 {f.label}
 </Label>
 <Input
 id={f.name}
 placeholder={f.placeholder}
 disabled={lockPermanentFields && f.name === "usn"}
 className={lockPermanentFields && f.name === "usn" ? "opacity-70 cursor-not-allowed" : undefined}
 {...register(f.name)}
 />
 {errors[f.name] && <p className="mt-1.5 text-xs text-red-400">{errors[f.name]?.message as string}</p>}
 </motion.div>
 ))}

 {!isRegistration && (
 <>
 <motion.div custom={3} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label className="mb-2 block">Section</Label>
 <Select value={section} onValueChange={(v) => setValue("section", v, { shouldValidate: true })}>
 <SelectTrigger>
 <SelectValue placeholder="Select section" />
 </SelectTrigger>
 <SelectContent>
 {SECTION_OPTIONS.map((s) => (
 <SelectItem key={s} value={s}>
 Section {s}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.section && <p className="mt-1.5 text-xs text-red-400">{errors.section.message as string}</p>}
 </motion.div>

 <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label className="mb-2 block">Branch</Label>
 <Select value={branch} onValueChange={(v) => setValue("branch", v, { shouldValidate: true })}>
 <SelectTrigger>
 <SelectValue placeholder="Select branch" />
 </SelectTrigger>
 <SelectContent>
 {BRANCH_OPTIONS.map((b) => (
 <SelectItem key={b} value={b}>
 {b}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.branch && <p className="mt-1.5 text-xs text-red-400">{errors.branch.message as string}</p>}
 </motion.div>

 <motion.div custom={5} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label className="mb-2 block">Year</Label>
 <Select value={year} onValueChange={(v) => setValue("year", v, { shouldValidate: true })}>
 <SelectTrigger>
 <SelectValue placeholder="Select year" />
 </SelectTrigger>
 <SelectContent>
 {YEAR_OPTIONS.map((y) => (
 <SelectItem key={y} value={y}>
 {y} Year
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.year && <p className="mt-1.5 text-xs text-red-400">{errors.year.message as string}</p>}
 </motion.div>

 <motion.div custom={6} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label className="mb-2 block">Semester</Label>
 <Select
 value={semester ? String(semester) : ""}
 onValueChange={(v) => setValue("semester", parseInt(v, 10), { shouldValidate: true })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select semester" />
 </SelectTrigger>
 <SelectContent>
 {SEMESTER_OPTIONS.map((sem) => (
 <SelectItem key={sem} value={String(sem)}>
 Semester {sem}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.semester && <p className="mt-1.5 text-xs text-red-400">{errors.semester.message as string}</p>}
 </motion.div>

 <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label className="mb-2 block">Favorite Domain</Label>
 <Select
 value={favoriteDomain}
 onValueChange={(v) => setValue("favoriteDomain", v, { shouldValidate: true })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select a domain" />
 </SelectTrigger>
 <SelectContent>
 {DOMAIN_OPTIONS.map((d) => (
 <SelectItem key={d} value={d}>
 {d}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.favoriteDomain && (
 <p className="mt-1.5 text-xs text-red-400">{errors.favoriteDomain.message as string}</p>
 )}
 </motion.div>
 </>
 )}

 {fields.slice(2).filter((f) => !isRegistration || f.name === "email").map((f, i) => (
 <motion.div key={f.name} custom={i + 5} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label htmlFor={f.name} className="mb-2 block">
 {f.label}
 </Label>
 <Input
 id={f.name}
 placeholder={f.placeholder}
 disabled={lockPermanentFields && f.name === "email"}
 className={lockPermanentFields && f.name === "email" ? "opacity-70 cursor-not-allowed" : undefined}
 {...register(f.name, {
 onBlur: async (e) => {
 if (f.name === "email" && !lockPermanentFields && e.target.value) {
 setEmailCheckLoading(true);
 setEmailDuplicateError(null);
 try {
 const exists = await checkEmailExists(e.target.value);
 if (exists) {
 setEmailDuplicateError("This email is already registered. Please log in instead.");
 }
 } catch (err) {
 // Silently fail checking; backend safety guard will catch duplicates on submit.
 } finally {
 setEmailCheckLoading(false);
 }
 }
 },
 })}
 />
 {errors[f.name] && <p className="mt-1.5 text-xs text-red-400">{errors[f.name]?.message as string}</p>}
 {f.name === "email" && emailDuplicateError && (
 <p className="mt-1.5 text-xs text-red-400">{emailDuplicateError}</p>
 )}
 {f.name === "email" && emailCheckLoading && (
 <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
 <Loader2 className="h-3 w-3 animate-spin" /> Checking email...
 </p>
 )}
 </motion.div>
 ))}
 </div>

 {!isRegistration && (
 <motion.div custom={9} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label htmlFor="bio" className="mb-2 block">
 Short Bio (optional)
 </Label>
 <Textarea id="bio" placeholder="Tell your classmates a little about yourself..." {...register("bio")} />
 {errors.bio && <p className="mt-1.5 text-xs text-red-400">{errors.bio.message as string}</p>}
 </motion.div>
 )}

 {!lockPermanentFields && (
 <div className="grid gap-5 sm:grid-cols-2">
 <motion.div custom={10} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label htmlFor="password" className="mb-2 block">
 Password
 </Label>
 <Input
 id="password"
 type="password"
 placeholder="At least 8 characters"
 autoComplete="new-password"
 {...register("password")}
 />
 {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message as string}</p>}
 </motion.div>

 {isRegistration && (
 <motion.div custom={11} initial="hidden" animate="visible" variants={fieldVariants}>
 <Label htmlFor="confirmPassword" className="mb-2 block">
 Confirm Password
 </Label>
 <Input
 id="confirmPassword"
 type="password"
 placeholder="Confirm your password"
 autoComplete="new-password"
 {...register("confirmPassword" as any)}
 />
 {errors.confirmPassword && (
 <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message as string}</p>
 )}
 </motion.div>
 )}
 </div>
 )}

 <motion.div custom={12} initial="hidden" animate="visible" variants={fieldVariants}>
 <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !!emailDuplicateError || emailCheckLoading}>
 {isSubmitting ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
 </>
 ) : (
 submitLabel
 )}
 </Button>
 </motion.div>
 </form>
 );
}
