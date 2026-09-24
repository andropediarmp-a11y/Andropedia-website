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
- **Instant Role Switcher**: Quick-test buttons in navigation and login (`Member`, `Domain Lead`, `Super Admin`) for friction-free demonstration.
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

## 🔑 Quick Demo Credentials

The platform features an instant role switcher in the header for effortless reviewer testing:
- **Member**: Aarav Sharma (`Web Domain`)
- **Domain Lead**: Vikramaditya Rao (`Web Domain Lead`)
- **Super Admin**: Dr. Siddharth Sen (`Faculty Advisor / Super Admin`)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Keep default settings (`Framework Preset: Next.js`).
4. Click **Deploy**. Both frontend pages and `/api/...` routes will be immediately live on the edge!

### Optional: Connecting to Managed PostgreSQL (Supabase / Neon)
1. Create a free database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Set the connection string in your environment variables:
   ```env
   DATABASE_URL="postgresql://postgres:password@your-host:5432/andropedia?schema=public"
   ```
3. Run Prisma migration:
   ```bash
   npx prisma db push
   ```

---

## 📄 License
Crafted with pride by the **Andropedia Technology Council**. All rights reserved.
