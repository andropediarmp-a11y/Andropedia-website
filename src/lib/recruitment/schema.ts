import { z } from "zod";

export const YEARS = ["first", "second", "third", "fourth", "other"] as const;
export const DOMAINS = ["technical", "web", "rd", "design", "media", "pr"] as const;

export const DOMAIN_LABELS: Record<(typeof DOMAINS)[number], string> = {
  technical: "Technical",
  web: "Web",
  rd: "R&D",
  design: "Design",
  media: "Media",
  pr: "Public Relations",
};

const REQUIRED = "This field is required.";
const text = (min: number, max: number, message: string) =>
  z.string({ error: REQUIRED }).trim().min(min, message).max(max, message);

export const applicationSchema = z.object({
  name: text(2, 80, "Enter your full name."),
  email: z
    .string({ error: REQUIRED })
    .trim()
    .toLowerCase()
    .max(160)
    .pipe(z.email("Enter a valid college email.")),
  year: z.enum(YEARS, "Select your year of study."),
  domain: z.enum(DOMAINS, "Select an Andropedia domain."),
  skills: text(20, 800, "Describe your experience in a little more detail (20+ characters)."),
  motivation: text(40, 1200, "Tell us a little more about why you want to join (40+ characters)."),
  domainAnswer: text(20, 800, "Answer the domain question in a little more detail (20+ characters)."),
  portfolioUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || (/^https?:\/\//i.test(v) && URL.canParse(v)), "Enter a valid http(s) URL.")
    .optional()
    .default(""),
  consent: z.literal(true, "Consent is required before submission."),
  // Honeypot: real users never see or fill this field.
  website: z.string().optional().default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export interface StoredApplication {
  reference: string;
  submittedAt: string;
  name: string;
  email: string;
  year: string;
  domain: string;
  skills: string;
  motivation: string;
  portfolioUrl: string;
  consent: boolean;
  domainAnswer: string;
}
