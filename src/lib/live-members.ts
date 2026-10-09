import { DomainType, User } from "./types";

// New-member Google Form responses. Only name, email, domain, LinkedIn, photo and bio are read:
// the sheet also holds phone numbers, dates of birth and register numbers, which stay out of the app.
const SHEET_ID = "10IU7_iEkeEuSEwa4iVe5la5VnYfdFZBkev3pCX0tVXM";
const PROFILE_SHEET_GID = "1957261300";

type GvizCell = { v?: string | number | null };
type GvizResponse = {
  table?: {
    rows?: Array<{ c?: Array<GvizCell | null> }>;
  };
};

const domainMap: Record<string, DomainType> = {
  technical: "Technical",
  web: "Web",
  "r&d": "R&D",
  "r & d": "R&D",
  design: "Design",
  media: "Media",
  "public relations": "PR",
  pr: "PR",
};

function cellValue(cell: GvizCell | null | undefined): string {
  return String(cell?.v ?? "").trim();
}

/** Null for anything that is not a real domain (e.g. a stray "core" entry), so that row is skipped. */
function normalizeDomain(value: string): DomainType | null {
  return domainMap[value.toLowerCase()] ?? null;
}

function normalizePhotoUrl(value: string): string {
  const match = value.match(/[?&]id=([^&]+)/);
  return match ? `/api/member-photo/${encodeURIComponent(match[1])}` : value;
}

export async function getLiveMembers(): Promise<User[]> {
  const query = encodeURIComponent("select B,C,H,I,K,L where B is not null");
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${PROFILE_SHEET_GID}&tq=${query}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Member sheet request failed with ${response.status}`);
  }

  const body = await response.text();
  const jsonText = body.replace(/^[\s\S]*?setResponse\(/, "").replace(/\);?\s*$/, "");
  const json = JSON.parse(jsonText) as GvizResponse;
  // Rows are in submission order. People who filled the form twice keep their latest answers.
  const byEmail = new Map<string, User>();
  for (const row of json.table?.rows || []) {
    const cells = row.c || [];
    const email = cellValue(cells[0]).toLowerCase();
    const name = cellValue(cells[1]).replace(/\s+/g, " ");
    const domain = normalizeDomain(cellValue(cells[3]));
    if (!email || !name || !domain) continue;

    byEmail.set(email, {
      id: `sheet_${email.replace(/[^a-z0-9]+/g, "_")}`,
      name,
      email,
      role: "member",
      domain,
      avatar: normalizePhotoUrl(cellValue(cells[4])),
      bio: cellValue(cells[5]),
      linkedin: cellValue(cells[2]),
      points: 0,
      tasksCompleted: 0,
      streakWeeks: 0,
    });
  }
  return [...byEmail.values()];
}
