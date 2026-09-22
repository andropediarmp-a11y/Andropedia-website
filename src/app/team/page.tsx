"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ExternalLink, Trophy, Shield } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { initialUsers } from "@/lib/data-store";
import { User } from "@/lib/types";

export default function TeamPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [members, setMembers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const domains = ["All", "Technical", "Web", "R&D", "Design", "Media", "PR"];

  useEffect(() => {
    fetch("/api/members", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setMembers(data.members);
        else setLoadError(true);
      })
      .catch((error) => {
        console.error("Team member load error:", error);
        setLoadError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMembers = members.filter((member) => {
    if (selectedDomain === "All") return true;
    return member.domain.toLowerCase() === selectedDomain.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Users className="w-3.5 h-3.5" />
            ANDROPEDIA FELLOWSHIP
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Meet the <span className="text-gradient-emerald">Team</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            The visionary leads, engineers, and creators building the future of our collegiate tech society.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                selectedDomain === d
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "glass-panel text-slate-300 hover:text-white hover:border-emerald-500/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-center text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
            Syncing live member profiles...
          </p>
        )}
        {loadError && (
          <p className="text-center text-xs text-amber-300">
            Showing the saved roster while live profiles reconnect.
          </p>
        )}

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredMembers.map((member) => {
            const isLead = member.role === "domain_admin" || member.role === "super_admin";
            return (
              <div
                key={member.id}
                className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group hover:scale-[1.02] ${
                  isLead ? "border-emerald-500/30 bg-emerald-950/10" : "border-white/10"
                }`}
                data-cursor-text={member.name}
              >
                <div className="space-y-4">
                  {/* Top Avatar & Badges */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400/30 group-hover:border-emerald-400 transition-colors shadow-lg"
                      />
                      {isLead && (
                        <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                          <Shield className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10 block">
                        {member.domain}
                      </span>
                      {member.points && (
                        <div className="text-xs font-mono font-bold text-amber-300 flex items-center justify-end gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          <span>{member.points} pts</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-emerald-400/90 font-medium capitalize">
                      {member.role === "super_admin"
                        ? "Faculty Advisor / Super Admin"
                        : member.role === "domain_admin"
                        ? `Domain Lead (${member.domain})`
                        : "Active Club Member"}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {member.bio || "Dedicated builder driving weekly tech challenges."}
                  </p>
                </div>

                {/* Socials & Profile Action */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-4">
                  <div className="flex items-center gap-2">
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        aria-label="GitHub"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        aria-label="LinkedIn"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <Link
                    href="/portal/login"
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>View Rank</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
