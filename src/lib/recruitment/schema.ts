import { z } from "zod";
import { DOMAIN_IDS, validateAnswers } from "./questions";

export const YEARS = ["first", "second", "third", "fourth", "other"] as const;
export const DOMAINS = DOMAIN_IDS;

export const DOMAIN_LABELS: Record<(typeof DOMAINS)[number], string> = {
  technical: "Technical",
  web: "Web",
  design: "Design",
  media: "Media",
  pr: "Public Relations",
};

const REQUIRED = "This field is required.";
const text = (min: number, max: number, message: string) =>
  z.string({ error: REQUIRED }).trim().min(min, message).max(max, message);

/** 10-15 digits, optionally with +, spaces, dashes or brackets. */
const PHONE = /^\+?[\d\s\-()]{10,20}$/;

export const applicationSchema = z.object({
  name: text(2, 80, "Enter your full name."),
  registerNo: text(3, 30, "Enter your register / roll number."),
  department: text(2, 60, "Enter your department."),
  year: z.enum(YEARS, "Select your year of study."),
  phone: z
    .string({ error: REQUIRED })
    .trim()
    .refine((v) => PHONE.test(v) && v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15, "Enter a valid phone / WhatsApp number."),
  email: z
    .string({ error: REQUIRED })
    .trim()
    .toLowerCase()
    .max(160)
    .pipe(z.email("Enter a valid email address.")),
  profile: text(3, 300, "Share a LinkedIn, GitHub or Instagram link or handle."),
  domain: z.enum(DOMAINS, "Select an Andropedia domain."),
  /** Raw answers; checked against the chosen domain's questions in `parseApplication`. */
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  consent: z.literal(true, "Consent is required before submission."),
  // Honeypot: real users never see or fill this field.
  website: z.string().optional().default(""),
});

export interface StoredApplication {
  reference: string;
  submittedAt: string;
  name: string;
  registerNo: string;
  department: string;
  year: string;
  phone: string;
  email: string;
  profile: string;
  domain: string;
  /** question id -> answer text, for the universal questions and the chosen domain only. */
  answers: Record<string, string>;
  consent: boolean;
}

export type ApplicationInput = Omit<z.infer<typeof applicationSchema>, "answers"> & {
  answers: Record<string, string>;
};

export type ParsedApplication =
  | { success: true; data: ApplicationInput }
  | { success: false; fieldErrors: Record<string, string[]> };

/** Validates the whole submission: basic details first, then the answers for the chosen domain. */
export function parseApplication(body: unknown): ParsedApplication {
  const base = applicationSchema.safeParse(body);
  const fieldErrors: Record<string, string[]> = {};
  if (!base.success) {
    for (const issue of base.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
  }

  // Answers are checked whenever the domain is valid, so one submit reports every problem.
  const domainParse = z.enum(DOMAINS).safeParse((body as { domain?: unknown } | null)?.domain);
  let answers: Record<string, string> = {};
  if (domainParse.success) {
    const rawAnswers = base.success ? base.data.answers : (body as { answers?: never } | null)?.answers ?? {};
    const checked = validateAnswers(domainParse.data, typeof rawAnswers === "object" && rawAnswers ? rawAnswers : {});
    answers = checked.answers;
    for (const [id, message] of Object.entries(checked.errors)) fieldErrors[id] = [message];
  }

  if (!base.success || Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
  return { success: true, data: { ...base.data, answers } };
}
