import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";
import xss from "xss";

// Runs the collected express-validator chains and returns a 422 on failure.
export function runValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      details: errors.array().map((e) => ({
        field: "path" in e ? (e as any).path : undefined,
        message: e.msg,
      })),
    });
  }
  next();
}

// Strips any HTML/script content from free-text fields to prevent stored XSS.
export function sanitizeBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (typeof req.body[field] === "string") {
        req.body[field] = xss(req.body[field].trim());
      }
    }
    next();
  };
}

const URL_REGEX = /^https?:\/\/.+/i;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/.+/i;
const PHONE_REGEX = /^[+]?[0-9]{7,15}$/;
const USN_REGEX = /^[A-Za-z0-9]{6,15}$/;
// Short branch codes that match the frontend BRANCH_OPTIONS.
const BRANCH_OPTIONS = [
  "CSE",
  "ISE",
  "AIML",
  "ECE",
  "Mechanical",
  "Civil",
  "Electrical",
  "Electronics",
  "Other",
  "CSBS",
  "AI DS",
];
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th"];

export const studentValidationRules: ValidationChain[] = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("usn")
    .trim()
    .notEmpty()
    .withMessage("USN is required")
    .matches(USN_REGEX)
    .withMessage("Enter a valid USN (letters/numbers, 6-15 characters)"),

  body("section")
    .trim()
    .notEmpty()
    .withMessage("Section is required")
    .isLength({ max: 10 })
    .withMessage("Section is too long"),

  body("branch")
    .trim()
    .notEmpty()
    .withMessage("Branch is required")
    .isIn(BRANCH_OPTIONS)
    .withMessage("Please select a valid branch"),

  body("year")
    .trim()
    .notEmpty()
    .withMessage("Year is required")
    .isIn(YEAR_OPTIONS)
    .withMessage("Please select a valid year"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(PHONE_REGEX)
    .withMessage("Enter a valid phone number (7-15 digits, optional +)"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("linkedin")
    .optional({ checkFalsy: true })
    .trim()
    .matches(LINKEDIN_REGEX)
    .withMessage("Enter a valid LinkedIn profile URL"),

  body("github")
    .optional({ checkFalsy: true })
    .trim()
    .matches(GITHUB_REGEX)
    .withMessage("Enter a valid GitHub profile URL"),

  body("portfolio")
    .optional({ checkFalsy: true })
    .trim()
    .matches(URL_REGEX)
    .withMessage("Enter a valid portfolio URL"),

  body("favoriteDomain")
    .trim()
    .notEmpty()
    .withMessage("Favorite domain is required"),

  body("skills")
    .trim()
    .notEmpty()
    .withMessage("At least one skill is required"),

  body("bio")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be under 500 characters"),

  body("photo").optional({ checkFalsy: true }).isString(),

  body("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters"),
];

export const loginValidationRules: ValidationChain[] = [
  body("email").trim().notEmpty().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const studentLoginValidationRules: ValidationChain[] = [
  body("email").trim().notEmpty().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];