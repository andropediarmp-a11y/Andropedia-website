import { describe, expect, it } from "vitest";
import { applicationSchema, parseApplication } from "@/lib/recruitment/schema";
import { ALL_QUESTION_IDS, DOMAIN_IDS, DOMAIN_QUESTIONS, UNIVERSAL_QUESTIONS, validateAnswers } from "@/lib/recruitment/questions";

const universal = {
  why_join: "Genuine passion for the craft",
  elevator: "Taking control and finding the emergency hatch",
};
const webAnswers = {
  web_center_div: "margin: auto, obviously. Or vibes.",
  web_faction: "Full-Stack",
  web_faction_reason: "I can blame myself for both halves.",
  web_deploy_fail: "My fault. Roll back to the previous release tag and post-mortem after the launch.",
  web_showcase: "https://github.com/priya/portfolio",
};

const valid = {
  name: "  Priya K  ",
  registerNo: "RA2511026020025",
  department: "CSE AIML A",
  year: "second",
  phone: "+91 98765 43210",
  email: "  Priya@College.EDU ",
  profile: "https://www.linkedin.com/in/priya",
  domain: "web",
  answers: { ...universal, ...webAnswers },
  consent: true,
};

describe("parseApplication", () => {
  it("accepts a valid application and normalises name and email", () => {
    const r = parseApplication(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Priya K");
      expect(r.data.email).toBe("priya@college.edu");
      expect(r.data.answers.web_faction).toBe("Full-Stack");
      expect(r.data.website).toBe("");
    }
  });

  it.each([
    ["name too short", { name: "P" }, "name"],
    ["missing register number", { registerNo: "" }, "registerNo"],
    ["missing department", { department: "" }, "department"],
    ["bad email", { email: "nope" }, "email"],
    ["unknown year", { year: "fifth" }, "year"],
    ["short phone", { phone: "12345" }, "phone"],
    ["phone with letters", { phone: "call me maybe" }, "phone"],
    ["missing profile", { profile: "" }, "profile"],
    ["unknown domain", { domain: "cooking" }, "domain"],
    ["no consent", { consent: false }, "consent"],
  ])("rejects %s", (_label, patch, field) => {
    const r = parseApplication({ ...valid, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.fieldErrors)).toContain(field);
  });

  it("uses friendly messages for missing fields (no raw zod text)", () => {
    const r = parseApplication({});
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(Object.values(r.fieldErrors).flat().join(" ")).not.toMatch(/expected string|Invalid input/i);
      expect(r.fieldErrors.name?.[0]).toBe("This field is required.");
    }
  });

  it("requires the universal answers", () => {
    const r = parseApplication({ ...valid, answers: webAnswers });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.fieldErrors)).toEqual(expect.arrayContaining(["why_join", "elevator"]));
  });

  it("requires the chosen domain's questions", () => {
    const r = parseApplication({ ...valid, answers: universal });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.fieldErrors)).toEqual(expect.arrayContaining(["web_faction", "web_showcase"]));
  });

  it("reports basic-detail and answer errors together", () => {
    const r = parseApplication({ ...valid, email: "nope", answers: universal });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.fieldErrors)).toEqual(expect.arrayContaining(["email", "web_faction"]));
  });

  it("drops answers that belong to other domains: one application, one domain", () => {
    const r = parseApplication({ ...valid, answers: { ...valid.answers, media_gear: "DSLR", tech_github: "https://github.com/x" } });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.answers.media_gear).toBeUndefined();
      expect(r.data.answers.tech_github).toBeUndefined();
      expect(Object.keys(r.data.answers).sort()).toEqual([...Object.keys(universal), ...Object.keys(webAnswers)].sort());
    }
  });

  it("does not require another domain's questions", () => {
    // A web application never needs media answers: valid above without any.
    expect(parseApplication(valid).success).toBe(true);
  });
});

describe("validateAnswers", () => {
  it("accepts only listed options for a choice", () => {
    expect(validateAnswers("web", { ...universal, ...webAnswers, web_faction: "Fullstack-ish" }).errors.web_faction).toBeDefined();
  });

  it('accepts "Other: ..." only where the question allows it, and needs text', () => {
    const ok = validateAnswers("web", { ...universal, ...webAnswers, why_join: "Other: I like robots" });
    expect(ok.errors.why_join).toBeUndefined();
    expect(ok.answers.why_join).toBe("Other: I like robots");
    expect(validateAnswers("web", { ...universal, ...webAnswers, why_join: "Other: " }).errors.why_join).toBeDefined();
    expect(validateAnswers("web", { ...universal, ...webAnswers, elevator: "Other: levitate" }).errors.elevator).toBeDefined();
  });

  it("checks scale ranges and whole numbers", () => {
    const base = { ...universal, design_logo_pop: "Breathe in, breathe out.", design_font: "Papyrus", design_font_defence: "It has character, mostly.", design_portfolio: "https://www.behance.net/x" };
    const ok = { ...base, design_figma: "5", design_illustrator: "1", design_photoshop: "3" };
    expect(validateAnswers("design", ok).errors).toEqual({});
    expect(validateAnswers("design", { ...ok, design_figma: "6" }).errors.design_figma).toBeDefined();
    expect(validateAnswers("design", { ...ok, design_figma: "2.5" }).errors.design_figma).toBeDefined();
    expect(validateAnswers("design", { ...ok, design_figma: "0" }).errors.design_figma).toBeDefined();
  });

  it("handles multi-select: needs one, only listed options, canonical order", () => {
    const base = {
      ...universal,
      pr_pitch: "We turn a hundred curious students into a pipeline of talent for your hiring.",
      pr_crisis: "Announce calmly, swap in a panel of student founders, and keep the energy up.",
      pr_cold_dm: "7",
    };
    expect(validateAnswers("pr", { ...base, pr_experience: [] }).errors.pr_experience).toBeDefined();
    expect(validateAnswers("pr", { ...base, pr_experience: ["Skydiving"] }).errors.pr_experience).toBeDefined();
    const r = validateAnswers("pr", { ...base, pr_experience: ["Emceeing", "Sponsorships"] });
    expect(r.errors).toEqual({});
    expect(r.answers.pr_experience).toBe("Sponsorships, Emceeing");
    expect(r.answers.pr_brag).toBe(""); // optional
  });

  it("accepts a multi-select sent as its cleaned, comma-joined string (the form's round trip)", () => {
    const base = {
      ...universal,
      pr_pitch: "We turn a hundred curious students into a pipeline of talent for your hiring.",
      pr_crisis: "Announce calmly, swap in a panel of student founders, and keep the energy up.",
      pr_cold_dm: "7",
    };
    const first = validateAnswers("pr", { ...base, pr_experience: ["Emceeing", "None yet, but I'm keen"] });
    expect(first.errors).toEqual({});
    expect(first.answers.pr_experience).toBe("Emceeing, None yet, but I'm keen");
    expect(validateAnswers("pr", first.answers).errors).toEqual({}); // cleaned output validates again
    expect(validateAnswers("pr", { ...base, pr_experience: "Skydiving" }).errors.pr_experience).toBeDefined();
    expect(validateAnswers("pr", { ...base, pr_experience: "Emceeing, Skydiving" }).errors.pr_experience).toBeDefined();
  });

  it("rejects non-http links and javascript: URLs", () => {
    const base = { ...universal, media_gear: "DSLR", media_sneeze: "Delete it immediately", media_trend: "All of them, honestly." };
    expect(validateAnswers("media", { ...base, media_portfolio: "javascript:alert(1)" }).errors.media_portfolio).toBeDefined();
    expect(validateAnswers("media", { ...base, media_portfolio: "ftp://x.com/a" }).errors.media_portfolio).toBeDefined();
    expect(validateAnswers("media", { ...base, media_portfolio: "https://drive.google.com/x" }).errors).toEqual({});
  });

  it("enforces text length ceilings", () => {
    const long = { ...universal, ...webAnswers, web_center_div: "x".repeat(401) };
    expect(validateAnswers("web", long).errors.web_center_div).toBeDefined();
  });

  it("scopes validation to universal or domain questions", () => {
    expect(Object.keys(validateAnswers("web", {}, "universal").errors).sort()).toEqual(UNIVERSAL_QUESTIONS.map((q) => q.id).sort());
    expect(Object.keys(validateAnswers("web", {}, "domain").errors).sort()).toEqual(DOMAIN_QUESTIONS.web.filter((q) => q.required).map((q) => q.id).sort());
  });
});

describe("question bank", () => {
  it("has unique ids, five domains, and a prefix per domain", () => {
    expect(new Set(ALL_QUESTION_IDS).size).toBe(ALL_QUESTION_IDS.length);
    expect(DOMAIN_IDS).toHaveLength(5);
    const prefix = { media: "media_", design: "design_", pr: "pr_", technical: "tech_", web: "web_" } as const;
    for (const d of DOMAIN_IDS) for (const q of DOMAIN_QUESTIONS[d]) expect(q.id.startsWith(prefix[d])).toBe(true);
  });
});

describe("applicationSchema (basic details only)", () => {
  it("defaults answers to empty and trims text", () => {
    const r = applicationSchema.safeParse({ ...valid, answers: undefined });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.answers).toEqual({});
  });
});
