import { Student } from "@prisma/client";

export interface SafeStudentProfile {
  id: string;
  name: string;
  usn: string;
  branch: string;
  section: string;
  year: string;
  semester: number;
  photo: string | null;
  bio: string | null;
  favoriteDomain: string;
  skills: string;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface MatchResult {
  student: SafeStudentProfile;
  matchedSkills: string[];
  missingSkills: string[];
  matchCount: number;
  requiredSkillCount: number;
  matchPercentage: number;
}

export function parseSkills(skillsString: string | null | undefined): string[] {
  if (!skillsString) return [];
  return skillsString
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function calculateMatch(
  student: SafeStudentProfile,
  teamRequiredSkillsString: string | null | undefined
): MatchResult {
  const requiredSkills = parseSkills(teamRequiredSkillsString);
  const studentSkills = parseSkills(student.skills);
  
  // Normalize student skills for fast lookups
  const studentSkillsNormalized = new Set(studentSkills.map(s => s.toLowerCase()));
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  // We want to remove duplicates from required skills, but preserve the original casing for UI
  const originalCaseMap = new Map<string, string>();
  for (const req of requiredSkills) {
    const lower = req.toLowerCase();
    if (!originalCaseMap.has(lower)) {
      originalCaseMap.set(lower, req);
    }
  }

  for (const [lower, original] of originalCaseMap.entries()) {
    if (studentSkillsNormalized.has(lower)) {
      matchedSkills.push(original);
    } else {
      missingSkills.push(original);
    }
  }
  
  const matchCount = matchedSkills.length;
  const requiredSkillCount = originalCaseMap.size;
  
  // If a team has no required skills, technically anyone is a 0% "match" to specific skills.
  const matchPercentage = requiredSkillCount === 0 
    ? 0 
    : Math.round((matchCount / requiredSkillCount) * 1000) / 10;
  
  return {
    student,
    matchedSkills,
    missingSkills,
    matchCount,
    requiredSkillCount,
    matchPercentage
  };
}

