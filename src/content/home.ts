import { Code2, Cpu, Globe, Megaphone, Palette, Video, Trophy, CheckCircle2, Users, Zap, type LucideIcon } from "lucide-react";

// Copy and data for the home page. Edit text here; the layout lives in src/components/home.

export interface HomeDomain {
  /** Matches the domain tab on /domains (R&D uses "RD" here and "R&D" in the URL). */
  id: "Technical" | "Web" | "RD" | "Design" | "Media" | "PR";
  /** Matches the database domain name used by /api/members. */
  apiDomain: "Technical" | "Web" | "R&D" | "Design" | "Media" | "PR";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
  activities: string[];
  stats: string;
}

export const HOME_DOMAINS: HomeDomain[] = [
  {
    id: "Technical", apiDomain: "Technical", title: "Technical", subtitle: "Algorithms & Core Systems", icon: Cpu,
    description: "Competitive programming, distributed architectures, low-level systems in Rust/C++, and DSA olympiads.",
    activities: ["Weekly Contest Sprints", "Lock-Free Systems", "ICPC & Hackathon Track"], stats: "15+ Medals Won",
  },
  {
    id: "Web", apiDomain: "Web", title: "Web Development", subtitle: "Full-Stack & Cloud Engines", icon: Globe,
    description: "State-of-the-art Next.js App Router, real-time websockets, microservices, cloud deployments, and resilient APIs.",
    activities: ["Production Web Apps", "Serverless & Edge APIs", "Micro-frontend Pipelines"], stats: "20+ Apps Deployed",
  },
  {
    id: "RD", apiDomain: "R&D", title: "R&D / AI Labs", subtitle: "Machine Intelligence & Research", icon: Code2,
    description: "Exploration in Generative AI, lightweight Vision Transformers, ONNX edge inference, and decentralized protocols.",
    activities: ["Applied LLM Fine-tuning", "Computer Vision Labs", "Paper Publications"], stats: "4 Papers Drafted",
  },
  {
    id: "Design", apiDomain: "Design", title: "Design & UX", subtitle: "Aesthetics & Interactive Systems", icon: Palette,
    description: "Dark-mode cyber design systems, micro-interactions, 3D asset generation, Figma token architectures, and usability audits.",
    activities: ["Design Systems (Figma)", "Spatial 3D Design", "Micro-interaction Tuning"], stats: "100+ UI Components",
  },
  {
    id: "Media", apiDomain: "Media", title: "Media & VFX", subtitle: "Visual Storytelling & Motion", icon: Video,
    description: "Cinematic trailers, motion graphics, video podcast engineering, event coverage, and creative brand identity.",
    activities: ["After Effects & 3D VFX", "Documentaries & Recaps", "Audio/Video Engineering"], stats: "50k+ Video Views",
  },
  {
    id: "PR", apiDomain: "PR", title: "Public Relations", subtitle: "Outreach & Corporate Alliances", icon: Megaphone,
    description: "Forging industry sponsorships, organizing campus hackathons, community evangelism, and national partnerships.",
    activities: ["Industry Tech Talks", "Hackathon Sponsorships", "Campus Ambassador Grid"], stats: "$15k+ Grants Raised",
  },
];

export const HOME_METRICS: Array<{ label: string; value: string; icon: LucideIcon; sub: string }> = [
  { label: "Active Members", value: "48+", icon: Users, sub: "Across 6 domains" },
  { label: "Weekly Tasks Evaluated", value: "240+", icon: CheckCircle2, sub: "Strict rubric scoring" },
  { label: "Hackathon Podiums", value: "14", icon: Trophy, sub: "National & regional wins" },
  { label: "Open-Source Projects", value: "18+", icon: Zap, sub: "Deployed & live" },
];

export const HOME_HIGHLIGHTS = [
  {
    tag: "Flagship hackathon",
    title: "AndroHacks 2026: The Cyber-Physical Frontier",
    date: "October 12-14, 2026",
    desc: "36-hour hackathon bringing 400+ developers together across AI, Edge Computing, and Sustainable Cloud Solutions.",
    badge: "Registrations Open",
    link: "/events",
    cta: "View events",
  },
  {
    tag: "Open source",
    title: "Vortex-Edge: Sub-millisecond Webhook Engine",
    date: "Shipped v2.4",
    desc: "Our Web & Technical domain open-source project featured on GitHub trending with 1,200+ stars.",
    badge: "1.2k GitHub Stars",
    link: "/projects",
    cta: "View projects",
  },
  {
    tag: "Weekly sprint",
    title: "Week 4 Sprint: Production Ready & Polished",
    date: "Currently live",
    desc: "Club members are submitting tasks for evaluation. Watch the live leaderboard podium shift in real time.",
    badge: "Sprint Active",
    link: "/portal/login",
    cta: "Open the portal",
  },
];

export const ABOUT_POINTS = [
  { title: "Weekly task cycles", text: "Hands-on challenges graded under comprehensive rubrics by domain leads." },
  { title: "Real-time transparency", text: "A live leaderboard that fosters healthy competition across the club." },
  { title: "Cross-domain synergy", text: "Web, R&D, Design, Media, Technical and PR working as one team." },
];
