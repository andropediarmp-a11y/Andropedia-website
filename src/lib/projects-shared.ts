// Types and constants shared by the server (lib/projects.ts) and the admin screen. No server imports here.
export const PROJECT_DOMAINS = ["Web", "Technical", "R&D", "Design", "Media", "PR"] as const;

export interface ProjectView {
  id: string;
  title: string;
  domain: string;
  description: string;
  tags: string[];
  github: string | null;
  live: string | null;
  status: string;
  isPublished: boolean;
}
