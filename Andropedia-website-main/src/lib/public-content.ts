import type { DomainType, PublicMemberProfile, User } from "./types";

export interface PublicNavigationItem {
  label: string;
  href: string;
}

export interface PublicDomain {
  id: DomainType;
  slug: string;
  name: string;
  summary?: string;
}

export type PublicProjectStatus = "upcoming" | "in-development" | "completed";

export interface PublicProject {
  id: string;
  title: string;
  status: PublicProjectStatus;
  summary: string;
  domain?: DomainType;
  image?: {
    src: string;
    alt: string;
  };
  repositoryUrl?: string;
  projectUrl?: string;
}

export type PublicEventType = "event" | "hackathon" | "workshop" | "talk";
export type PublicEventStatus = "announced" | "registration-open" | "full" | "completed";

export interface PublicEvent {
  id: string;
  title: string;
  type: PublicEventType;
  status: PublicEventStatus;
  summary: string;
  startDate: string;
  endDate?: string;
  location?: string;
  registrationUrl?: string;
  image?: {
    src: string;
    alt: string;
  };
}

function safePublicUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeAvatarUrl(value: string) {
  if (value.startsWith("/api/member-photo/")) return value;
  return safePublicUrl(value) || "";
}

export function toPublicMemberProfile(user: User): PublicMemberProfile {
  return {
    id: user.id,
    name: user.name,
    domain: user.domain,
    avatar: safeAvatarUrl(user.avatar),
    bio: user.bio,
    github: safePublicUrl(user.github),
    linkedin: safePublicUrl(user.linkedin),
    portfolio: safePublicUrl(user.portfolio),
  };
}
