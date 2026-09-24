import type { PublicDomain } from "@/lib/public-content";

export const publicDomains = [
  { id: "Technical", slug: "technical", name: "Technical", summary: "Algorithms, systems thinking, and the foundations beneath reliable technology." },
  { id: "Web", slug: "web", name: "Web Development", summary: "Accessible digital products shaped from interface through deployment." },
  { id: "R&D", slug: "research-and-development", name: "Research & Development", summary: "Questions explored through experiments, prototypes, and careful documentation." },
  { id: "Design", slug: "design", name: "Design", summary: "Clear visual systems and useful experiences built around real people." },
  { id: "Media", slug: "media", name: "Media", summary: "The club’s work documented through image, sound, film, and motion." },
  { id: "PR", slug: "public-relations", name: "Public Relations", summary: "Relationships, communication, and the coordination that connects work with people." },
] satisfies readonly PublicDomain[];
