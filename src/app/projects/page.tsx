"use client";

import { useEffect, useState } from "react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { FolderGit2, ExternalLink, Search } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";

interface Project {
  id: string;
  title: string;
  domain: string;
  description: string;
  tags: string[];
  github: string | null;
  live: string | null;
  status: string;
}

export default function ProjectsPage() {
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) throw new Error("load failed");
        setProjects(data.projects);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  const domains = ["All", "Web", "Technical", "R&D", "Design", "PR"];

  const filtered = projects.filter((p) => {
    const matchesDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesQuery;
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <GridLines variant="hero" />
      <BlurOrb variant="features" size={800} opacity={0.35} position={{ left: "50%", top: "360px" }} />
      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="chip">
            <FolderGit2 className="w-3.5 h-3.5" />
            ANDROPEDIA OPEN SOURCE
          </div>
          <h1 className="text-[40px] sm:text-[60px] font-medium leading-[1.05] tracking-[-2px] sm:tracking-[-3px]">
            <span className="text-fade">Club</span> <span className="text-aurora">projects</span>
          </h1>
          <p className="text-white/70 text-base leading-6">
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

        {state !== "ready" || filtered.length === 0 ? (
          <p className="text-center text-sm text-white/60 py-16">
            {state === "loading"
              ? "Loading projects..."
              : state === "error"
                ? "We couldn't load the projects right now. Please try again shortly."
                : projects.length === 0
                  ? "Our members' projects will be showcased here soon."
                  : "No projects match your search."}
          </p>
        ) : null}

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
