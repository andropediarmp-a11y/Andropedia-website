"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Cpu, 
  Globe, 
  Palette, 
  Video, 
  Megaphone, 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Users, 
  Layers, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  Star
} from "lucide-react";
import { ParticleHeroCanvas } from "@/components/home/ParticleHeroCanvas";
import DomainsPage from "@/app/domains/page";
import TeamPage from "@/app/team/page";
import ProjectsPage from "@/app/projects/page";
import EventsPage from "@/app/events/page";

export default function HomePage() {
  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  const domains = [
    {
      id: "Technical",
      title: "Technical",
      subtitle: "Algorithms & Core Systems",
      icon: Cpu,
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-400",
      border: "hover:border-emerald-500/50",
      description: "Competitive programming, distributed architectures, low-level systems in Rust/C++, and DSA olympiads.",
      activities: ["Weekly Contest Sprints", "Lock-Free Systems", "ICPC & Hackathon Track"],
      stats: "15+ Medals Won"
    },
    {
      id: "Web",
      title: "Web Development",
      subtitle: "Full-Stack & Cloud Engines",
      icon: Globe,
      color: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-400",
      border: "hover:border-cyan-500/50",
      description: "State-of-the-art Next.js App Router, real-time websockets, microservices, cloud deployments, and resilient APIs.",
      activities: ["Production Web Apps", "Serverless & Edge APIs", "Micro-frontend Pipelines"],
      stats: "20+ Apps Deployed"
    },
    {
      id: "RD",
      title: "R&D / AI Labs",
      subtitle: "Machine Intelligence & Research",
      icon: Code2,
      color: "from-violet-500/20 to-purple-500/20",
      accent: "text-violet-400",
      border: "hover:border-violet-500/50",
      description: "Exploration in Generative AI, lightweight Vision Transformers, ONNX edge inference, and decentralized protocols.",
      activities: ["Applied LLM Fine-tuning", "Computer Vision Labs", "Paper Publications"],
      stats: "4 Papers Drafted"
    },
    {
      id: "Design",
      title: "Design & UX",
      subtitle: "Aesthetics & Interactive Systems",
      icon: Palette,
      color: "from-fuchsia-500/20 to-pink-500/20",
      accent: "text-fuchsia-400",
      border: "hover:border-fuchsia-500/50",
      description: "Dark-mode cyber design systems, micro-interactions, 3D asset generation, Figma token architectures, and usability audits.",
      activities: ["Design Systems (Figma)", "Spatial 3D Design", "Micro-interaction Tuning"],
      stats: "100+ UI Components"
    },
    {
      id: "Media",
      title: "Media & VFX",
      subtitle: "Visual Storytelling & Motion",
      icon: Video,
      color: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-400",
      border: "hover:border-amber-500/50",
      description: "Cinematic trailers, motion graphics, video podcast engineering, event coverage, and creative brand identity.",
      activities: ["After Effects & 3D VFX", "Documentaries & Recaps", "Audio/Video Engineering"],
      stats: "50k+ Video Views"
    },
    {
      id: "PR",
      title: "Public Relations",
      subtitle: "Outreach & Corporate Alliances",
      icon: Megaphone,
      color: "from-rose-500/20 to-red-500/20",
      accent: "text-rose-400",
      border: "hover:border-rose-500/50",
      description: "Forging industry sponsorships, organizing campus hackathons, community evangelism, and national partnerships.",
      activities: ["Industry Tech Talks", "Hackathon Sponsorships", "Campus Ambassador Grid"],
      stats: "$15k+ Grants Raised"
    }
  ];

  const highlights = [
    {
      tag: "FLAGSHIP HACKATHON",
      title: "AndroHacks 2026: The Cyber-Physical Frontier",
      date: "October 12-14, 2026",
      desc: "36-hour hackathon bringing 400+ developers together across AI, Edge Computing, and Sustainable Cloud Solutions.",
      badge: "Registrations Open",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      link: "/events"
    },
    {
      tag: "OPEN SOURCE",
      title: "Vortex-Edge: Sub-millisecond Webhook Engine",
      date: "Shipped v2.4",
      desc: "Our Web & Technical domain open-source project featured on GitHub trending with 1,200+ stars.",
      badge: "1.2k GitHub Stars",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      link: "/projects"
    },
    {
      tag: "WEEKLY SPRINT",
      title: "Week 4 Sprint: Production Ready & Polished",
      date: "Currently Live",
      desc: "Club members are submitting tasks for evaluation. Watch the live leaderboard podium shift in real time.",
      badge: "Sprint Active",
      badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      link: "/portal/leaderboard"
    }
  ];

  const metrics = [
    { label: "Active Members", value: "48+", icon: Users, sub: "Across 6 domains" },
    { label: "Weekly Tasks Evaluated", value: "240+", icon: CheckCircle2, sub: "Strict rubric scoring" },
    { label: "Hackathon Podiums", value: "14", icon: Trophy, sub: "National & regional wins" },
    { label: "Open-Source Projects", value: "18+", icon: Zap, sub: "Deployed & live" },
  ];

  const testimonials = [
    {
      quote: "Andropedia's weekly task and evaluation loop pushed me from writing basic React components to building production-grade distributed edge systems.",
      author: "Aarav Sharma",
      role: "Member, Web Domain",
      rank: "Rank #1 (Week 3)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      quote: "The rigor here matches top tier startup engineering teams. Peer reviews and domain lead feedback make every week an immense learning acceleration.",
      author: "Diya Patel",
      role: "Member, R&D Domain",
      rank: "Rank #2 (Week 3)",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
      quote: "Managing evaluations and watching members climb the leaderboard has created the healthiest, most energized competitive atmosphere on campus.",
      author: "Vikramaditya Rao",
      role: "Domain Lead, Web",
      rank: "Lead Evaluator",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#080b11] text-slate-100 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] radial-glow pointer-events-none z-0" />

      {/* ================= HERO SECTION ================= */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative min-h-[92vh] flex items-center justify-center pt-12 pb-24 px-4 sm:px-6 lg:px-8"
      >
        <ParticleHeroCanvas />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Live Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel text-xs font-mono text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 hover:border-emerald-400 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ANDROPEDIA SPRINT 4 LIVE &bull; EVALUATION WINDOW ACTIVE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Pioneering Technology. <br />
              <span className="text-gradient-emerald">Building Creators.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 font-normal leading-relaxed">
              Andropedia is the student technology society where high-velocity engineering, 
              algorithmic mastery, and radical creativity converge through weekly sprints and live member evaluations.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/portal/login"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm sm:text-base hover:from-emerald-400 hover:to-teal-400 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
              data-cursor-text="Podium"
            >
              <Trophy className="w-5 h-5 text-slate-950" />
              <span>Explore Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/join"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel text-white font-semibold text-sm sm:text-base hover:bg-white/10 hover:border-emerald-500/40 transition-all"
              data-cursor-text="Join"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Join Andropedia</span>
            </Link>

            <Link
              href="/domains"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
            >
              <span>Explore Domains &rarr;</span>
            </Link>
          </motion.div>

          {/* Floating Terminal Code Snip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl mx-auto mt-8 text-left glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-300">andropedia-sprint.sh</span>
              </div>
              <span className="text-emerald-400 font-semibold">WEEK 4: ACTIVE</span>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-slate-300 pt-3 leading-relaxed overflow-x-auto">
              <code>
                <span className="text-emerald-400">$</span> git clone andropedia/sprint-4-production<br />
                <span className="text-cyan-400">✓</span> Task verified: 6 domains synchronized<br />
                <span className="text-emerald-400">✓</span> Scoring criteria: Architecture, Innovation, Quality<br />
                <span className="text-violet-400">&gt;&gt;</span> Current Top Rank: <span className="text-amber-300 font-bold">Aarav Sharma</span> (Web) - 382 pts
              </code>
            </pre>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= CLUB METRICS COUNTER ================= */}
      <motion.section
        {...fadeUp}
        className="relative z-10 border-y border-white/[0.08] bg-[#0c121e]/60 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {metrics.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl glass-card">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {item.value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-slate-300">{item.label}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ================= ABOUT SECTION ================= */}
      <motion.section id="about" {...fadeUp} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
                <Terminal className="w-3.5 h-3.5" />
                ABOUT ANDROPEDIA
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Not Just a Club. <br />
                <span className="text-gradient-emerald">An Engineering Forge.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-base">
                Andropedia was created to eliminate the gap between collegiate textbook theory and real-world high-performance software craftsmanship. 
                We operate across six specialized domains to transform passionate students into elite engineers, designers, researchers, and tech leaders.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Weekly Task Cycles: Hands-on challenges graded under comprehensive rubrics",
                  "Real-Time Transparency: Live leaderboards fostering healthy competition",
                  "Cross-Domain Synergy: Web, R&D, Design, Media, Technical, and PR working as one",
                  "Mentorship from Alumni at top tech organizations and research labs"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  href="/team"
                  className="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Meet our Core Council & Domain Leads &rarr;
                </Link>
              </div>
            </div>

            {/* Visual Glass Bento Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="font-bold text-white text-lg">Engineering Rigor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We don&apos;t settle for hackathon prototypes that break. We engineer scalable systems, clean APIs, and stress-tested code.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 sm:mt-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="font-bold text-white text-lg">Weekly Sprints</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every member submits weekly deliverables. Domain leads evaluate code quality, technical depth, and innovation.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="font-bold text-white text-lg">Open Source First</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our libraries and tools are published openly. Members build high-credibility public GitHub portfolios from day one.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 sm:mt-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h3 className="font-bold text-white text-lg">Cross-Domain Synergy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineering without design is unusable; design without engineering is intangible. All 6 domains collaborate seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= DOMAINS OVERVIEW ================= */}
      <motion.section id="domains" {...fadeUp} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#090e17]/80 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Layers className="w-3.5 h-3.5" />
              SPECIALIZED DIVISIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              The Six Pillars of <span className="text-gradient-emerald">Andropedia</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Each domain is spearheaded by experienced leads with dedicated weekly curriculums, projects, and evaluation benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.id}
                  className={`glass-panel p-7 rounded-2xl border border-white/10 transition-all duration-300 ${domain.border} group flex flex-col justify-between`}
                  data-cursor-text={domain.title}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.color} border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${domain.accent}`} />
                      </div>
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/[0.06] text-slate-300 border border-white/5">
                        {domain.stats}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{domain.subtitle}</p>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {domain.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Key Focus:</span>
                      {domain.activities.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/#domains-detail"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all"
                    >
                      <span>Explore Domain Track</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ================= HIGHLIGHTS & SPRINT EVENTS ================= */}
      <motion.section {...fadeUp} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono">
                <Flame className="w-3.5 h-3.5" />
                HIGHLIGHTS & MILESTONES
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Upcoming Hackathons & Active Projects
              </h2>
            </div>
            <Link
              href="/#events"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Events & Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-7 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                      {item.tag}
                    </span>
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{item.date}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-6">
                  <Link
                    href={item.link === "/portal/leaderboard" ? "/portal/login" : item.link}
                    className="text-xs font-semibold text-white group-hover:text-emerald-400 inline-flex items-center gap-1.5"
                  >
                    <span>Learn More</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="domains-detail" {...fadeUp} className="scroll-mt-20">
        <DomainsPage />
      </motion.section>

      <motion.section id="team" {...fadeUp} className="scroll-mt-20">
        <TeamPage />
      </motion.section>

      <motion.section id="projects" {...fadeUp} className="scroll-mt-20">
        <ProjectsPage />
      </motion.section>

      <motion.section id="events" {...fadeUp} className="scroll-mt-20">
        <EventsPage />
      </motion.section>

      {/* ================= TESTIMONIALS ================= */}
      <motion.section {...fadeUp} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0c121e]/50 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Voices From the Forge</h2>
            <p className="text-slate-400 text-sm">
              Hear from our student members and leads on how the weekly evaluation system elevates engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover border border-emerald-400/40"
                  />
                  <div>
                    <div className="font-semibold text-white text-sm">{t.author}</div>
                    <div className="text-xs text-slate-400 font-mono">{t.role}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">{t.rank}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ================= JOIN BANNER CTA ================= */}
      <motion.section {...fadeUp} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-cyan-950/60 border border-emerald-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            RECRUITMENT CYCLE ACTIVE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build the Future with <br className="hidden sm:inline" />
            <span className="text-gradient-emerald">Andropedia?</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Whether you code distributed backends, train AI models, design visual masterworks, or produce cinematic media — there is a high-impact seat for you.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/join"
              className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/25 hover:scale-105"
            >
              Apply for Recruitment 2026 &rarr;
            </Link>
            <Link
              href="/portal/login"
              className="px-6 py-4 rounded-xl glass-panel text-white font-semibold text-base hover:bg-white/10 transition-all"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
