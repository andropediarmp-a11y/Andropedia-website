import type { ClubPosition, DomainType, User } from "./types";

export type TeamMember = Omit<User, "email" | "isActive">;

/** Order the domains appear on the Our Team page. */
export const TEAM_DOMAINS: Array<{ id: DomainType; slug: string; label: string; blurb: string }> = [
  { id: "Technical", slug: "technical", label: "Technical", blurb: "Systems, algorithms and competitive programming." },
  { id: "Web", slug: "web", label: "Web Development", blurb: "Next.js, TypeScript, cloud and APIs." },
  { id: "R&D", slug: "rd", label: "R&D", blurb: "Machine learning, vision and research." },
  { id: "Design", slug: "design", label: "Design", blurb: "UI/UX, Figma systems and motion." },
  { id: "PR", slug: "pr", label: "Public Relations", blurb: "Sponsorships, outreach and events." },
  { id: "Media", slug: "media", label: "Media", blurb: "Photography, video and visual storytelling." },
];

export const POSITION_LABELS: Record<ClubPosition, string> = {
  president: "President",
  vice_president: "Vice President",
  chief: "Chief",
  lead: "Lead",
  co_lead: "Co-Lead",
  member: "Member",
};

const byName = (a: TeamMember, b: TeamMember) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

export interface DomainGroup {
  domain: (typeof TEAM_DOMAINS)[number];
  leads: TeamMember[];
  coLeads: TeamMember[];
  members: TeamMember[];
  total: number;
}

export interface TeamGroups {
  president: TeamMember[];
  vicePresident: TeamMember[];
  /** Chiefs, one per domain, ordered like TEAM_DOMAINS. */
  chiefs: TeamMember[];
  domains: DomainGroup[];
}

/**
 * Core = President, Vice President and each domain's Chief.
 * Every domain then lists its Leads, then Co-Leads, then regular members.
 * People appear once: core titles are not repeated inside their domain.
 */
export function groupTeam(members: TeamMember[]): TeamGroups {
  const position = (m: TeamMember): ClubPosition => m.position ?? "member";
  const domainRank = (m: TeamMember) => TEAM_DOMAINS.findIndex((d) => d.id === m.domain);

  return {
    president: members.filter((m) => position(m) === "president").sort(byName),
    vicePresident: members.filter((m) => position(m) === "vice_president").sort(byName),
    chiefs: members
      .filter((m) => position(m) === "chief")
      .sort((a, b) => domainRank(a) - domainRank(b) || byName(a, b)),
    domains: TEAM_DOMAINS.map((domain) => {
      const inDomain = members.filter((m) => m.domain === domain.id);
      const leads = inDomain.filter((m) => position(m) === "lead").sort(byName);
      const coLeads = inDomain.filter((m) => position(m) === "co_lead").sort(byName);
      const regular = inDomain.filter((m) => position(m) === "member").sort(byName);
      return { domain, leads, coLeads, members: regular, total: leads.length + coLeads.length + regular.length };
    }),
  };
}
