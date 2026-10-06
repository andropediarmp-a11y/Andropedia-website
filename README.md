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
- **Email-code login** with server-side sessions; every portal API checks the session and role on the server.
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

Members log in with their email: the site emails a 6-digit code (valid 10 minutes), which starts a secure session. Only emails that exist in the database can log in.

- **Local development:** if SMTP isn't configured, the code is printed in the terminal running `npm run dev` (`[dev] Login code for ...`). `npm run db:seed` creates demo accounts such as `aarav.sharma@andropedia.club` (member), `lead.web@andropedia.club` (domain lead) and `admin@andropedia.club` (super admin).
- **Real members:** `npm run db:import-members` copies members from the club's Google Sheet into the database (safe to re-run).
- **First super admin:** `npm run user:set-role -- you@college.edu super_admin Technical "Your Name"`
- **Change a role / switch someone off:** `npm run user:set-role -- email member|domain_admin|super_admin [domain]` and `npm run user:deactivate -- email`
- **Production:** set `AUTH_SECRET` (see `.env.example`) and the SMTP variables; without SMTP no codes can be delivered.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Keep default settings (`Framework Preset: Next.js`).
4. Click **Deploy**. Both frontend pages and `/api/...` routes will be immediately live on the edge!

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

---

## 📄 License
Crafted with pride by the **Andropedia Technology Council**. All rights reserved.
