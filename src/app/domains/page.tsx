"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, 
  Globe, 
  Code2, 
  Palette, 
  Video, 
  Megaphone, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";

function DomainsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "Technical";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  const domainData: Record<string, {
    title: string;
    tagline: string;
    icon: any;
    lead: {
      name: string;
      role: string;
      avatar: string;
      bio: string;
      github?: string;
      linkedin?: string;
    };
    description: string;
    techStack: string[];
    curriculum: { week: string; topic: string }[];
    notableProjects: { title: string; desc: string; link?: string; tags: string[] }[];
  }> = {
    Technical: {
      title: "Technical Domain",
      tagline: "High-Performance Systems & Competitive Algorithmic Excellence",
      icon: Cpu,
      lead: {
        name: "Pooja Reddy",
        role: "Domain Lead, Technical",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        bio: "ICPC Regionalist, Rust fanatic, and author of distributed lock-free concurrent primitives.",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      description: "The Technical division specializes in low-level systems programming, algorithms, competitive programming, and systems design. Members tackle tough algorithmic problems and engineer concurrent, fault-tolerant infrastructure.",
      techStack: ["C++20", "Rust", "Go", "Distributed Systems", "Linux Kernel", "Docker", "Algorithms & DSA"],
      curriculum: [
        { week: "Sprint 1", topic: "Advanced Graph Theory & Flow Networks" },
        { week: "Sprint 2", topic: "Lock-free Concurrent Data Structures in Rust" },
        { week: "Sprint 3", topic: "Custom TCP/UDP Protocol Implementation" },
        { week: "Sprint 4", topic: "Distributed Consensus (Raft Engine) & Stress Testing" },
      ],
      notableProjects: [
        {
          title: "Lock-Free B-Tree Engine",
          desc: "Cache-conscious concurrent indexing structure with epoch-based garbage collection.",
          tags: ["Rust", "Systems", "Concurrency"],
          link: "https://github.com"
        },
        {
          title: "AndroOJ - Algorithmic Judge",
          desc: "Sandboxed competitive programming execution engine supporting 12 languages with cgroups.",
          tags: ["Go", "Linux Cgroups", "Microservices"],
          link: "https://github.com"
        }
      ]
    },
    Web: {
      title: "Web Development",
      tagline: "Scalable Full-Stack Architecture, Next.js & Modern Cloud Systems",
      icon: Globe,
      lead: {
        name: "Vikramaditya Rao",
        role: "Domain Lead, Web",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        bio: "Full-stack cloud architect obsessed with sub-millisecond edge latency and elegant UI systems.",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      description: "From modern App Router frontends with buttery Framer Motion animations to resilient serverless backends and GraphQL APIs, the Web domain engineers production-ready web products.",
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Redis", "Docker"],
      curriculum: [
        { week: "Sprint 1", topic: "Modern Component Architecture & State Engines" },
        { week: "Sprint 2", topic: "Edge Middleware, Caching & Distributed Rate Limiters" },
        { week: "Sprint 3", topic: "Real-time WebSockets & Streaming SSR" },
        { week: "Sprint 4", topic: "CI/CD, Lighthouse 100 Performance & Cloud Deployment" },
      ],
      notableProjects: [
        {
          title: "Vortex-Edge Webhook Gateway",
          desc: "High-throughput serverless webhook delivery hub with automatic retry and signature verification.",
          tags: ["Next.js", "Redis", "Cloudflare Workers"],
          link: "https://github.com"
        },
        {
          title: "Andropedia Club Platform",
          desc: "The very platform you are using — built with Next.js, Framer Motion, and real-time member evaluations.",
          tags: ["Next.js", "TypeScript", "Tailwind CSS"],
          link: "https://github.com"
        }
      ]
    },
    "R&D": {
      title: "Research & Development / AI Labs",
      tagline: "Frontier Machine Intelligence, Computer Vision & Emerging Paradigms",
      icon: Code2,
      lead: {
        name: "Diya Patel",
        role: "Research Lead, R&D",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        bio: "Deep Learning researcher specializing in Vision Transformers and edge model quantization.",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      description: "The R&D division explores theoretical breakthroughs and converts them into deployed prototypes. Focus areas include Transformer architectures, computer vision, quantized inference on edge hardware, and zero-knowledge proofs.",
      techStack: ["PyTorch", "Python", "Hugging Face", "ONNX Runtime", "CUDA", "TensorFlow", "FastAPI"],
      curriculum: [
        { week: "Sprint 1", topic: "Attention Mechanisms & Transformer Fine-Tuning" },
        { week: "Sprint 2", topic: "Quantization (FP16/INT8) & ONNX WebGL Inference" },
        { week: "Sprint 3", topic: "Computer Vision: Real-time Object Tracking" },
        { week: "Sprint 4", topic: "Decentralized Federated Learning on Edge Devices" },
      ],
      notableProjects: [
        {
          title: "EdgeViT Gesture Parser",
          desc: "Distilled Vision Transformer performing real-time hand gesture parsing in the browser at 60 FPS.",
          tags: ["PyTorch", "ONNX", "WebGL"],
          link: "https://github.com"
        },
        {
          title: "NeuroDoc QA Engine",
          desc: "Retrieval-augmented generation agent for searching and summarizing technical research papers.",
          tags: ["LangChain", "Vector DB", "FastAPI"],
          link: "https://github.com"
        }
      ]
    },
    Design: {
      title: "Design & UX",
      tagline: "Futuristic Design Systems, Ergonomics & Motion Craftsmanship",
      icon: Palette,
      lead: {
        name: "Sneha Mukherjee",
        role: "Design Director",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        bio: "Product designer crafting digital experiences with high visual polish, fluid motion, and accessible tokens.",
        linkedin: "https://linkedin.com",
      },
      description: "The Design domain bridges the physical and digital world through design thinking, spatial UI/UX, responsive design tokens in Figma, 3D assets in Spline/Blender, and pixel-perfect design systems.",
      techStack: ["Figma", "Design Systems", "Spline 3D", "Blender", "Prototyping", "WCAG 2.2 a11y"],
      curriculum: [
        { week: "Sprint 1", topic: "Design Tokens, Auto Layout v5 & Typographic Scales" },
        { week: "Sprint 2", topic: "Dark-Mode Ergonomics & Glassmorphic Surface Architecture" },
        { week: "Sprint 3", topic: "Micro-interactions & Physics-based Prototyping" },
        { week: "Sprint 4", topic: "Design Handoff & Frontend Code Collaboration" },
      ],
      notableProjects: [
        {
          title: "AndroUI Cyber Design System",
          desc: "Comprehensive 50+ component dark-mode UI library with accessibility-tested contrast tokens.",
          tags: ["Figma", "Design System", "Tokens"],
          link: "https://figma.com"
        },
        {
          title: "Spatial Campus 3D Map",
          desc: "Interactive low-poly 3D campus navigation asset suite modeled for WebGL rendering.",
          tags: ["Blender", "3D", "WebGL"],
          link: "https://behance.net"
        }
      ]
    },
    Media: {
      title: "Media & VFX",
      tagline: "Cinematography, Motion Graphics & Visual Identity",
      icon: Video,
      lead: {
        name: "Karan Singhania",
        role: "Media Producer & Lead",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        bio: "Cinematographer and After Effects specialist telling the visual story of campus tech builders.",
        linkedin: "https://linkedin.com",
      },
      description: "The Media domain leads all visual storytelling for Andropedia: from cinematic event aftermovies and motion-graphics teasers to video podcasts, photography, and brand identity films.",
      techStack: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Cinema 4D", "Audio Production"],
      curriculum: [
        { week: "Sprint 1", topic: "Camera Dynamics, Lighting Rigs & Composition" },
        { week: "Sprint 2", topic: "Motion Graphics & Dynamic Keyframe Interpolation" },
        { week: "Sprint 3", topic: "Color Grading in DaVinci Resolve & Sound Design" },
        { week: "Sprint 4", topic: "Live Event Streaming & Technical Broadcasting" },
      ],
      notableProjects: [
        {
          title: "AndroHacks 2026 Teaser Reel",
          desc: "3D motion typography and sound design teaser reaching 25,000+ views across collegiate platforms.",
          tags: ["After Effects", "Cinema 4D", "Sound Design"]
        },
        {
          title: "The Binary Broadcast Podcast",
          desc: "Weekly video podcast interviewing founders, alumni, and tech domain leads on campus.",
          tags: ["Video Production", "Premiere Pro", "Audio Master"]
        }
      ]
    },
    PR: {
      title: "Public Relations & Outreach",
      tagline: "Strategic Partnerships, Community Growth & Event Leadership",
      icon: Megaphone,
      lead: {
        name: "Ananya Iyer",
        role: "Head of PR & Outreach",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
        bio: "Community strategist connecting campus developers with leading enterprise sponsors and global communities.",
        linkedin: "https://linkedin.com",
      },
      description: "PR & Outreach represents Andropedia to the university, industry sponsors, and peer hackathon ecosystems. They secure company partnerships, manage public events, and ensure community visibility.",
      techStack: ["Corporate Sponsorships", "Event Management", "Content Marketing", "Community Ops"],
      curriculum: [
        { week: "Sprint 1", topic: "Sponsorship Pitch Decks & Corporate Outreach" },
        { week: "Sprint 2", topic: "Hackathon Logistics, Budgeting & Venue Operations" },
        { week: "Sprint 3", topic: "Campus Ambassador Networks & Viral Marketing" },
        { week: "Sprint 4", topic: "Alumni Relations & Post-Event ROI Reporting" },
      ],
      notableProjects: [
        {
          title: "Industry Sponsorship Grid 2026",
          desc: "Secured partnerships with 8 high-growth tech firms offering bounties and cloud credits.",
          tags: ["Partnerships", "Sponsorship", "Operations"]
        },
        {
          title: "Tech Society Alliance",
          desc: "Formed a collaborative network of 12 collegiate tech clubs for joint hackathons.",
          tags: ["Community", "Growth", "Events"]
        }
      ]
    }
  };

  const currentDomain = domainData[activeTab] || domainData["Technical"];
  const CurrentIcon = currentDomain.icon;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Layers className="w-3.5 h-3.5" />
            SPECIALIZED OPERATING DOMAINS
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Explore Andropedia <span className="text-gradient-emerald">Domains</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Select a domain to inspect its lead, weekly curriculum, tech stack, and notable club projects.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 glass-panel rounded-2xl max-w-4xl mx-auto border border-white/10">
          {Object.keys(domainData).map((key) => {
            const isActive = activeTab === key;
            const DomainIcon = domainData[key].icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                }`}
                data-cursor-text={key}
              >
                <DomainIcon className="w-4 h-4" />
                <span>{key}</span>
              </button>
            );
          })}
        </div>

        {/* Active Domain Showcase Card */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden space-y-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Title & Tagline */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CurrentIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{currentDomain.title}</h2>
              </div>
              <p className="text-slate-400 text-base">{currentDomain.tagline}</p>
            </div>

            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shrink-0"
            >
              <span>Apply for {activeTab}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Description & Lead Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">About This Domain</h3>
              <p className="text-slate-300 leading-relaxed text-base">{currentDomain.description}</p>

              {/* Tech Stack Chips */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Technologies & Frameworks:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentDomain.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-white/[0.06] text-emerald-300 border border-white/10 text-xs font-mono font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weekly Sprint Curriculum */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Weekly Sprints & Milestones:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDomain.curriculum.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{item.week}</span>
                      <p className="text-sm font-medium text-slate-200">{item.topic}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lead Card */}
            <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Award className="w-4 h-4" />
                <span>DOMAIN LEAD</span>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={currentDomain.lead.avatar}
                  alt={currentDomain.lead.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400/40"
                />
                <div>
                  <h4 className="font-bold text-white text-lg">{currentDomain.lead.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{currentDomain.lead.role}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{currentDomain.lead.bio}</p>
              <div className="flex items-center gap-3 pt-2">
                {currentDomain.lead.github && (
                  <a
                    href={currentDomain.lead.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {currentDomain.lead.linkedin && (
                  <a
                    href={currentDomain.lead.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Notable Projects in Domain */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">
              Notable Domain Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentDomain.notableProjects.map((proj, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">{proj.title}</h4>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{proj.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080b11] p-12 text-center text-slate-400">Loading domains...</div>}>
      <DomainsContent />
    </Suspense>
  );
}
