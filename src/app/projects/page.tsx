"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, ExternalLink, Star, Search, Filter, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";

export default function ProjectsPage() {
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const projects = [
    {
      id: "proj_1",
      title: "Vortex-Edge: Real-time Webhook Hub",
      domain: "Web",
      description: "Distributed webhook ingestion and fan-out engine running on edge runtimes with Redis stream buffering and automated exponential backoff.",
      tags: ["Next.js", "TypeScript", "Redis", "Cloudflare Workers"],
      github: "https://github.com",
      live: "https://vortex-edge.demo.app",
      stars: 1240,
      status: "Live & Open Source"
    },
    {
      id: "proj_2",
      title: "EdgeViT: Micro Gesture Transformer",
      domain: "R&D",
      description: "Distilled Vision Transformer achieving 98.2% accuracy in hand gesture parsing with FP16 WebGL quantization running at 60 FPS in browsers.",
      tags: ["PyTorch", "ONNX", "WebGL", "TypeScript"],
      github: "https://github.com",
      live: "https://edgevit.demo.app",
      stars: 890,
      status: "Research Prototype"
    },
    {
      id: "proj_3",
      title: "Lock-Free B-Tree Engine in Rust",
      domain: "Technical",
      description: "Concurrent lock-free B-Tree implementation using epoch-based memory reclamation for ultra-high throughput write and scan operations.",
      tags: ["Rust", "Atomic Primitives", "Concurrency", "Linux"],
      github: "https://github.com",
      stars: 670,
      status: "Production Library"
    },
    {
      id: "proj_4",
      title: "AndroUI Cyberpunk Design System",
      domain: "Design",
      description: "Full-scale dark mode component architecture in Figma and React with WCAG AAA accessible contrast modes and fluid CSS micro-animations.",
      tags: ["Figma", "Design Tokens", "Tailwind CSS", "Storybook"],
      live: "https://androui.demo.app",
      stars: 450,
      status: "Design System"
    },
    {
      id: "proj_5",
      title: "AndroOJ - Distributed Judge",
      domain: "Technical",
      description: "Sandboxed competitive programming execution engine supporting 12 languages with Linux cgroups security isolation and automated memory profiling.",
      tags: ["Go", "Docker", "Linux Cgroups", "gRPC"],
      github: "https://github.com",
      stars: 520,
      status: "Campus Deployment"
    },
    {
      id: "proj_6",
      title: "Sponsorship & Partnership Hub",
      domain: "PR",
      description: "Dynamic portal tracking corporate outreach, grant allocations, mentor allocations, and hackathon prize bounties across 15+ sponsors.",
      tags: ["Next.js", "PostgreSQL", "Tailwind CSS"],
      github: "https://github.com",
      stars: 210,
      status: "Internal Operations"
    }
  ];

  const domains = ["All", "Web", "Technical", "R&D", "Design", "PR"];

  const filtered = projects.filter((p) => {
    const matchesDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <FolderGit2 className="w-3.5 h-3.5" />
            ANDROPEDIA OPEN SOURCE
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Club <span className="text-gradient-emerald">Projects</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            High-impact software, algorithmic frameworks, research prototypes, and design systems built by our members.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, tag, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  selectedDomain === d
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel p-7 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
              data-cursor-text="Project"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {proj.domain}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{proj.stars}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {proj.title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">{proj.status}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10 mt-6">
                {proj.github && (
                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>Source</span>
                  </a>
                )}
                {proj.live && (
                  <a
                    href={proj.live}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
