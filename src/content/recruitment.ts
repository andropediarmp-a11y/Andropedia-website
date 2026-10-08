// Copy for the dedicated recruitment page (/join). Edit the text here; no code changes needed.
// NOTE: the process steps, eligibility and "why join" text are v1 placeholders written from
// the existing site copy. Replace them with the club's real selection process and dates.

export const RECRUITMENT_CYCLE = "Recruitment 2026";

export type DomainId = "technical" | "web" | "rd" | "design" | "media" | "pr";

export interface RecruitDomain {
  id: DomainId;
  name: string;
  desc: string;
  /** Domain-specific question asked in step 3 of the form. */
  question: string;
  placeholder: string;
}

export const RECRUIT_DOMAINS: RecruitDomain[] = [
  {
    id: "technical",
    name: "Technical",
    desc: "C++, Rust, systems, DSA and competitive programming.",
    question: "Describe a hard technical or algorithmic problem you solved. What was your approach?",
    placeholder: "e.g. a contest problem, a performance bug, or a systems project and how you cracked it...",
  },
  {
    id: "web",
    name: "Web",
    desc: "Next.js, TypeScript, cloud, APIs and microservices.",
    question: "Tell us about a web project you built or want to build. Which stack would you use and why?",
    placeholder: "e.g. what it does, the stack, and one decision you would defend...",
  },
  {
    id: "rd",
    name: "R&D",
    desc: "Machine learning, PyTorch, vision and research papers.",
    question: "Which paper, model or research idea excites you most, and what would you try with it?",
    placeholder: "e.g. a paper you read, what you understood, and an experiment you would run...",
  },
  {
    id: "design",
    name: "Design",
    desc: "UI/UX, Figma systems, 3D assets and micro-interactions.",
    question: "Pick a product you use daily. What is one thing you would redesign, and how?",
    placeholder: "e.g. the problem you see, your idea, and who it helps. Share portfolio links above.",
  },
  {
    id: "media",
    name: "Media",
    desc: "Cinematography, After Effects, VFX and video podcasts.",
    question: "Describe a video, edit or visual piece you made or admire. What made it work?",
    placeholder: "e.g. the idea, the tools you used, and what you would improve...",
  },
  {
    id: "pr",
    name: "Public Relations",
    desc: "Sponsorships, hackathon logistics and community alliances.",
    question: "How would you get 200 students to attend a club event? Outline your plan.",
    placeholder: "e.g. channels, partners, timeline and how you would measure success...",
  },
];

export const WHY_JOIN = [
  { title: "Build real things", text: "Weekly sprints with real deliverables, reviewed by domain leads, not just lectures." },
  { title: "Get honest feedback", text: "Every submission is scored on technical depth, innovation, completion and documentation." },
  { title: "Grow with a community", text: "Hackathons, workshops and a leaderboard shared with the sharpest builders on campus." },
];

export const ELIGIBILITY = [
  "Any undergraduate or postgraduate student of the college, in any branch.",
  "1st, 2nd and 3rd year students are especially welcome.",
  "No prior experience required: curiosity and consistency matter most.",
  "You can commit roughly 6 to 10 hours a week to the sprint.",
];

export const PROCESS_STEPS = [
  { title: "Apply online", text: "Fill the application below. It takes about 10 minutes. You will get a confirmation email with a reference ID." },
  { title: "Application review", text: "Domain leads read every application for your chosen domain." },
  { title: "Shortlist by email", text: "Shortlisted candidates are contacted by email with the next step. Dates are announced by email." },
  { title: "Interview / task round", text: "A short conversation or small task so we can see how you think and build." },
  { title: "Welcome to Andropedia", text: "Selected members get portal access and join their first weekly sprint." },
];

export const FAQS = [
  {
    q: "Who is eligible to apply for Andropedia?",
    a: "Any undergraduate or postgraduate student with an active appetite for engineering, design, or community building. We welcome 1st, 2nd, and 3rd year students across all branches.",
  },
  {
    q: "How does the weekly task and evaluation cycle work?",
    a: "Once inducted, each domain assigns weekly challenges tailored to current industry and research demands. Members submit deliverables via our portal, which domain leads evaluate on technical depth, innovation, completion, and documentation. Scores update the live leaderboard.",
  },
  {
    q: "What is the expected weekly time commitment?",
    a: "Typically 6 to 10 hours per week, covering the weekly task sprint, domain sync discussions, and collaborative weekend hack sessions.",
  },
  {
    q: "Can I contribute to more than one domain?",
    a: "Yes! While each member has a primary domain for weekly evaluations and leaderboard tracking, cross-domain collaboration on hackathons and flagship projects is strongly encouraged.",
  },
  {
    q: "Can I apply more than once?",
    a: "Only one application is accepted per email address, so take your time to make it count. If you made a mistake, contact the club using the email you receive after applying.",
  },
];
