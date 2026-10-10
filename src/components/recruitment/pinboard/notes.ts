import { DOMAIN_QUESTIONS, UNIVERSAL_QUESTIONS, type DomainId, type Question } from "@/lib/recruitment/questions";
import { BONUS_XP, LEVEL_XP } from "../game/config";

// The pin board questionnaire: every question (or small group of related fields) is one note.
// Level 0 = Basics, 1 = Vibe check, 2 = Choose class (no notes: the class cards are the board),
// 3 = Domain round, 4 = Review.

export interface NoteDef {
  /** Stable id: "who", "campus", ... or "q:<question id>". */
  key: string;
  level: number;
  /** Small label on top of the note, e.g. "Note 2 · On campus". */
  tag: string;
  title: string;
  /** One line shown on a note that has not been answered yet. */
  hint: string;
  /** Form fields / question ids this note owns: its errors are the errors of these keys. */
  keys: string[];
  optional: boolean;
  /** Present for question notes: the open note renders the question itself. */
  question?: Question;
}

const BASICS: Omit<NoteDef, "level" | "optional" | "tag">[] = [
  { key: "who", title: "Name and register number", hint: "2 fields · both required", keys: ["name", "registerNo"] },
  { key: "campus", title: "Department and year", hint: "2 fields · both required", keys: ["department", "year"] },
  { key: "reach", title: "Phone and email", hint: "2 fields · both required", keys: ["phone", "email"] },
  { key: "proof", title: "Your profile link", hint: "LinkedIn, GitHub or Instagram · required", keys: ["profile"] },
];
const BASIC_TAGS = ["Who", "On campus", "Reach you", "Proof"];
const UNIVERSAL_TAGS: Record<string, string> = { why_join: "Motive", elevator: "Crisis" };

const kindHint = (q: Question): string => {
  if (!q.required) return "Optional · never blocks Continue";
  if (q.hint) return `${q.hint} · required`;
  switch (q.kind) {
    case "choice":
      return "Pick one · required";
    case "multi":
      return "Pick any that fit · required";
    case "scale":
      return `Rate ${q.from} to ${q.to} · required`;
    case "url":
      return "A link · required";
    default:
      return "Your own words · required";
  }
};

function questionNotes(level: number, questions: Question[], tags: Record<string, string> = {}): NoteDef[] {
  return questions.map((q, i) => ({
    key: `q:${q.id}`,
    level,
    tag: !q.required ? `Note ${i + 1} · Bonus` : tags[q.id] ? `Note ${i + 1} · ${tags[q.id]}` : `Note ${i + 1} of ${questions.length}`,
    title: q.label,
    hint: kindHint(q),
    keys: [q.id],
    optional: !q.required,
    question: q,
  }));
}

export function notesForLevel(level: number, domain: DomainId | ""): NoteDef[] {
  if (level === 0) return BASICS.map((n, i) => ({ ...n, level, tag: `Note ${i + 1} · ${BASIC_TAGS[i]}`, optional: false }));
  if (level === 1) return questionNotes(1, UNIVERSAL_QUESTIONS, UNIVERSAL_TAGS);
  if (level === 3 && domain) return questionNotes(3, DOMAIN_QUESTIONS[domain]);
  return [];
}

/** Every note key that can exist for a domain's round (used to drop them when the class changes). */
export const domainNoteKeys = (domain: DomainId | ""): string[] => (domain ? DOMAIN_QUESTIONS[domain].map((q) => `q:${q.id}`) : []);

/**
 * XP for pinning each required note: the level's 100 XP shared out evenly (the first notes take any
 * remainder, so a level always adds up to exactly 100). Optional notes are worth a flat bonus.
 */
export function noteXp(notes: NoteDef[]): Record<string, number> {
  const required = notes.filter((n) => !n.optional);
  const base = Math.floor(LEVEL_XP / Math.max(required.length, 1));
  let extra = LEVEL_XP - base * required.length;
  const out: Record<string, number> = {};
  for (const n of notes) {
    if (n.optional) out[n.key] = BONUS_XP;
    else {
      out[n.key] = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra--;
    }
  }
  return out;
}
