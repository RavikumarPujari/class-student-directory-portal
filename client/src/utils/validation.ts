import { z } from "zod";

const URL_REGEX = /^https?:\/\/.+/i;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/.+/i;
const PHONE_REGEX = /^[+]?[0-9]{7,15}$/;
const USN_REGEX = /^[A-Za-z0-9]{6,15}$/;

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
  section: z.string().trim().min(1, "Section is required").max(10, "Section is too long"),
  phone: z.string().trim().regex(PHONE_REGEX, "Enter a valid phone number (7-15 digits)"),
  email: z.string().trim().email("Enter a valid email address"),
  linkedin: z.string().trim().regex(LINKEDIN_REGEX, "Enter a valid LinkedIn profile URL"),
  github: z.string().trim().regex(GITHUB_REGEX, "Enter a valid GitHub profile URL"),
  portfolio: z
    .string()
    .trim()
    .regex(URL_REGEX, "Enter a valid URL")
    .optional()
    .or(z.literal("")),
  favoriteDomain: z.string().min(1, "Favorite domain is required"),
  skills: z.string().trim().min(1, "Add at least one skill"),
  bio: z.string().trim().max(500, "Bio must be under 500 characters").optional().or(z.literal("")),
  photo: z.string().optional(),
});

export type StudentFormSchema = z.infer<typeof studentSchema>;

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

export const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];
