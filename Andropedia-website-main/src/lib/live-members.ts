import { DomainType, User } from "./types";

const SHEET_ID = "1BXNFLQLYXTD4syZQHWp5WtcBIxdPkzjPOKTkBVtg640";
const PROFILE_SHEET_GID = "160539106";

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

function normalizeDomain(value: string): DomainType {
  return domainMap[value.toLowerCase()] || "Technical";
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
  const seenEmails = new Set<string>();

  return (json.table?.rows || []).flatMap((row): User[] => {
    const cells = row.c || [];
    const email = cellValue(cells[0]).toLowerCase();
    const name = cellValue(cells[1]);
    if (!email || !name || seenEmails.has(email)) return [];
    seenEmails.add(email);

    return [{
      id: `sheet_${email.replace(/[^a-z0-9]+/g, "_")}`,
      name,
      email,
      role: "member",
      domain: normalizeDomain(cellValue(cells[3])),
      avatar: normalizePhotoUrl(cellValue(cells[4])),
      bio: cellValue(cells[5]),
      linkedin: cellValue(cells[2]),
      points: 0,
      tasksCompleted: 0,
      streakWeeks: 0,
    }];
  });
}