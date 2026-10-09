# Andropedia — Official Student Technology Club Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-purple?style=flat)](https://www.framer.com/motion/)

> **Pioneering Technology. Building Creators.**  
> The official, production-ready website and weekly sprint evaluation platform for the **Andropedia** student technology club.

---

## 🚀 Architecture Highlights

The platform is designed with a **frontend-heavy, zero-friction backend architecture**:
- **Full-Stack Next.js App Router**: Marketing pages and backend API endpoints live in a single unified repository, enabling 1-click deployment to **Vercel** or **Netlify** with zero separate backend server maintenance.
- **Buttery 60+ FPS Custom Cursor**: Dual-layer cursor (precise inner dot + outer lerp ring) running on `requestAnimationFrame` with hover state awareness, magnetic chip triggers, and automatic disabling on touch screens.
- **Interactive Cyber Aesthetic**: Constellation particle canvas hero, glassmorphic bento cards, neon glow borders, and fluid Framer Motion transitions.
- **Dual-Storage Zero-Config Engine**: Works out-of-the-box with pre-seeded data for all 6 club domains, while supplying a complete **Prisma schema** for connecting to PostgreSQL (Supabase, Neon, Railway).

---

## 🏛️ Six Core Domains

1. **Technical**: Low-level systems programming (Rust, C++), competitive programming (ICPC track), and distributed architectures.
2. **Web**: Next.js App Router, real-time WebSockets, microservices, edge computing, and cloud deployment.
3. **R&D / AI Labs**: Applied Machine Learning, lightweight Vision Transformers (ViT), edge model quantization, and research papers.
4. **Design & UX**: Cyberpunk design systems in Figma, spatial 3D assets, WCAG accessibility tokens, and physics micro-interactions.
5. **Media & VFX**: Cinematic trailers, 3D motion typography, video podcast production, and event recaps.
6. **Public Relations**: Corporate sponsorships, collegiate alliances, community operations, and hackathon organization.

---

## ⚡ Core Features

### 🌐 Public Marketing Experience
- **Landing Page (`/`)**: Hero with interactive particle matrix, live sprint indicator, club metrics counter, 6 domain overview cards, featured open-source tools, member testimonials, and recruitment CTA.
- **Domains Deep-Dive (`/domains`)**: Tabbed interactive explorer with domain leads, tech stack badges, weekly curriculum roadmap, and notable projects.
- **Team Directory (`/team`)**: Core council, domain leads, and members with role badges, domain filters, and GitHub/LinkedIn links.
- **Projects Showcase (`/projects`)**: Searchable project cards with tech tags, stars counter, live demos, and source code links.
- **Events & Hackathons (`/events`)**: Flagship hackathons (*AndroHacks 2026*), workshops, and live RSVP seat reservation.
- **Recruitment Application (`/join`)**: Interactive candidate application form with domain preference selector and FAQ accordion.

### 🏆 Member & Admin Evaluation Portal
- **Register-number login** (username and password are the member's register number) with server-side sessions; every portal API checks the session and role on the server.
- **Member Dashboard (`/portal/dashboard`)**: Personal score radar, active sprint prompt, streak flame counter, and recent task review feedback.
- **Weekly Task Submission (`/portal/submit-task`)**: Form allowing members to submit code repositories, live demo URLs, Figma files, and architectural notes.
- **Domain Lead Evaluation Queue (`/portal/evaluations`)**: Inspect submitted code, score deliverables using a 4-rubric slider (0-100 total score), and provide constructive feedback.
- **Live Leaderboard Podium (`/portal/leaderboard`)**:
  - Top 3 3D-styled Podium (Gold, Silver, Bronze) with crown badges.
  - Interactive confetti trigger on podium click.
  - Filter by Domain (All, Technical, Web, R&D, Design, Media, PR).
  - Filter by Timeframe (All-Time, Current Week, Monthly).
  - Full ranking table with rank changes (+1, -1), streak counters, and badges.
- **Super Admin Console (`/portal/admin`)**: Toggle weekly submission windows and audit club-wide member rosters.

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- Node.js 18.x or 20.x+
- npm (or pnpm / yarn / bun)

### 2. Clone & Install
```bash
git clone https://github.com/your-org/andropedia-web.git
cd andropedia-web
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Logging in

Members log in with their **register number**: the username and the starting password are both the register number (case and spaces ignored). Passwords are stored hashed, logins are rate-limited (20 tries an hour per account, 30 per address), and every failure gets the same message. Only active members with a register number on their account can log in.

- **Local development:** `npm run db:seed` creates demo accounts, but they have no register number, so give one a login with `npm run user:set-register-no -- <email> <register number>`.
- **Real members:** `npm run db:import-members` copies members from the club's Google Form sheet (including the Register Number column) into the database and sets their login. Safe to re-run: it never changes an existing role or a password that was already set.
- **First super admin:** `npm run user:set-role -- you@example.com super_admin Technical "Your Name"`, then `npm run user:set-register-no -- you@example.com <your register number> [a stronger password]`. Use a password that is not your register number for admin accounts.
- **Change a role / switch someone off:** `npm run user:set-role -- email member|domain_admin|super_admin [domain]` and `npm run user:deactivate -- email`
- **Our Team page (`/team`):** each member has a team position (President, Vice President, Chief, Lead, Co-Lead or Member). Everyone imported from the sheet starts as Member in their domain. Set positions with `npm run team:set-position -- email chief Technical` or in bulk with `npm run team:import-positions -- docs/team-positions.example.csv` (copy the example and fill it in). Positions don't change portal permissions: use `user:set-role` to give a Lead the `domain_admin` role.
- **Production:** set `AUTH_SECRET` (see `.env.example`). It is mixed into every password hash, so changing it later invalidates all passwords until `user:set-register-no` is run again for each account. Email (SMTP or the Apps Script web app) is still used for confirmations and notices, but not for login.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Keep default settings (`Framework Preset: Next.js`).
4. Click **Deploy**. Both frontend pages and `/api/...` routes will be immediately live on the edge!

### Running recruitment
- **Open / close:** `RECRUITMENT_OPEN=false` closes it immediately; `RECRUITMENT_OPENS_AT` / `RECRUITMENT_CLOSES_AT` (ISO dates with a timezone, e.g. `2026-10-20T23:59:00+05:30`) schedule it. The server enforces this on every submission and `/join` shows the deadline or a closed message. Restart or redeploy after changing environment variables.
- **Where applications go:** the database (`Application` table) is the source of truth. The Google Sheet (see `.env.example`) is a mirror, written right after the applicant gets their reference ID. If the Sheet or the confirmation email fails, `npm run recruitment:retry` (or `GET /api/cron/recruitment-flush` with `Authorization: Bearer $CRON_SECRET`, from any scheduler every 15 minutes or so) copies the missing rows and re-sends the missing emails. Hosting cron features that only allow a daily run are not enough on their own; use an external scheduler or run the command by hand.
- **Reviewing applicants:** super admins use **Portal -> Admin Panel -> Recruitment applicants**: filter, read the answers, set the status (new, shortlisted, accepted, rejected), optionally email the decision, and export CSV. API: `GET /api/admin/applications`, `PATCH /api/admin/applications/:id`.
- **Applicant status:** applicants check their status on `/join` with their reference ID and email (`POST /api/recruitment/lookup`, rate-limited).
- **Health check:** `GET /api/health` (database reachable). With the `CRON_SECRET` bearer token it also lists configuration problems and how many applications still need a Sheet row or a confirmation email.
- **Rate limits** are counted in the database (`RateLimit` table) so they hold across server instances, with an in-memory fallback if the database is unreachable. `GET /api/cron/maintenance` clears old counters.
- **Tests:** `npm test` (validation, deadline rules, duplicate detection, sheet retries, the application route, retry sync, login and sessions, role checks on every admin route, grading, projects).

### Running the club (admin)
Super admins manage the club from **Portal -> Admin Panel**, or through the API:
- **Sprint weeks:** open or close a week (only one is open at a time). Members can submit only to the open week, one submission each, editable until it is graded. API: `GET/POST /api/admin/weeks`, `PATCH /api/admin/weeks/:id`.
- **Members:** change a member's portal role, team position, domain or active status. You can't demote or deactivate yourself, and the last super admin can't be removed. Deactivating someone signs them out everywhere. API: `PATCH /api/admin/members/:id`.
- **Audit log:** every grade, week change and member change is recorded. API: `GET /api/admin/audit`.
- **Leaderboard:** computed from graded evaluations only. All-time, "weekly" (the open week) and "monthly" (last 30 days) views; rank change compares with the standings before the latest graded week; streaks count consecutive graded weeks.
- **Housekeeping:** `npm run db:cleanup` (or `GET /api/cron/maintenance` with the `CRON_SECRET` bearer token, daily) removes expired sessions and old rate-limit counters. Each member keeps at most 10 sessions.

### Database setup (Supabase Postgres + Prisma)
The API reads and writes a Postgres database through Prisma.
1. Create a Supabase project and copy `.env.example` to `.env`.
2. Fill `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from Supabase -> Connect.
3. Create the tables:
   ```bash
   npm run db:deploy          # applies prisma/migrations
   npm run db:import-members  # real members from the club Google Sheet (safe to re-run)
   npm run user:set-role -- you@college.edu super_admin Technical "Your Name"   # first admin
   ```
   `npm run db:seed` loads **demo** data (fake members and a demo super admin) for local development only; it refuses to run against a non-local database unless `ALLOW_DEMO_SEED=1`.
4. For schema changes during development use `npm run db:migrate`.

Set the same `DATABASE_URL` in your hosting provider's environment variables (e.g. Vercel).

**Supabase security:** every table has Row Level Security enabled with no policies (migration `..._rls`). Supabase exposes the `public` schema through a public Data API; with RLS on and no policies that API can read and write nothing. The app talks to Postgres directly through Prisma as the table owner, which bypasses RLS, so it keeps working. Do not add policies or disable RLS.


---

## 📄 License
Crafted with pride by the **Andropedia Technology Council**. All rights reserved.
