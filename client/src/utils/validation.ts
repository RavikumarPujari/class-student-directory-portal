import { z } from "zod";

const URL_REGEX = /^https?:\/\/.+/i;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/.+/i;
const PHONE_REGEX = /^[+]?[0-9]{7,15}$/;
const USN_REGEX = /^[A-Za-z0-9]{6,15}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

// Shared student profile fields (used for register + profile edit).
export const studentSchema = z.object({
 name: z
 .string()
 .trim()
 .min(2, "Name must be at least 2 characters")
 .max(100, "Name must be under 100 characters"),
 usn: z
 .string()
 .trim()
 .regex(USN_REGEX, "Enter a valid USN (letters/numbers, 6-15 characters)"),
 section: z.string().trim().max(10, "Section is too long").optional().or(z.literal("")),
 branch: z.string().optional().or(z.literal("")),
 year: z.string().optional().or(z.literal("")),
 semester: z.coerce.number().int().min(1, "Semester is required").max(8, "Semester must be 1-8").optional().or(z.literal("").transform(() => undefined)),
 phone: z.string().trim().regex(PHONE_REGEX, "Enter a valid phone number (7-15 digits)").optional().or(z.literal("")),
 email: z.string().trim().email("Enter a valid email address"),
 linkedin: z
 .string()
 .trim()
 .regex(LINKEDIN_REGEX, "Enter a valid LinkedIn profile URL")
 .optional()
 .or(z.literal("")),
 github: z
 .string()
 .trim()
 .regex(GITHUB_REGEX, "Enter a valid GitHub profile URL")
 .optional()
 .or(z.literal("")),
 portfolio: z
 .string()
 .trim()
 .regex(URL_REGEX, "Enter a valid URL")
 .optional()
 .or(z.literal("")),
 favoriteDomain: z.string().optional().or(z.literal("")),
 skills: z.string().trim().optional().or(z.literal("")),
 bio: z.string().trim().max(500, "Bio must be under 500 characters").optional().or(z.literal("")),
 photo: z.string().optional(),
 // Optional password — required on registration, optional when editing your profile.
 password: z
 .string()
 .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
 .max(PASSWORD_MAX, `Password must be under ${PASSWORD_MAX} characters`)
 .optional()
 .or(z.literal("")),
});

export type StudentFormSchema = z.infer<typeof studentSchema>;

// Registration requires a password.
export const registerSchema = studentSchema.extend({
 password: z
 .string()
 .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
 .max(PASSWORD_MAX, `Password must be under ${PASSWORD_MAX} characters`),
 confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
 message: "Passwords don't match",
 path: ["confirmPassword"],
});
export type RegisterFormSchema = z.infer<typeof registerSchema>;

// Student login form.
export const studentLoginSchema = z.object({
 email: z.string().trim().email("Enter a valid email address"),
 password: z.string().min(1, "Password is required"),
});
export type StudentLoginSchema = z.infer<typeof studentLoginSchema>;

export const DOMAIN_OPTIONS = [
 "Full Stack Development",
 "Data Science",
 "Machine Learning / AI",
 "Cybersecurity",
 "Cloud Computing",
 "Mobile App Development",
 "DevOps",
 "UI/UX Design",
 "Blockchain",
 "Competitive Programming",
 "Embedded Systems / IoT",
 "Other",
];

export const SECTION_OPTIONS = ["A", "B",];

export const BRANCH_OPTIONS = [
 "CSE",
 "CSBS",
 "AI/DS",
 "AI/ML",
 "ISE",
 "ECE",
 "Mechanical",
 "Civil",
 "Electrical",
 "Electronics",
 "Other",
];

export const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th"];

export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];