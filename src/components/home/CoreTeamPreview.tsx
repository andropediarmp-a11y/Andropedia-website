"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function Avatar({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  const base = "w-20 h-20 rounded-2xl border-2 border-emerald-400/40 shadow-lg";
  if (!member.avatar || failed) {
    return (
      <div className={`${base} flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-300 text-xl font-bold`} aria-hidden="true">
        {initials(member.name)}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img loading="lazy" decoding="async" src={member.avatar} alt="" onError={() => setFailed(true)} className={`${base} object-cover`} />;
}

function PersonCard({ member, title }: { member: TeamMember; title: string }) {
  return (
    <li className="glass-panel w-full sm:w-56 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 text-center flex flex-col items-center gap-2">
      <Avatar member={member} />
      <h3 className="mt-2 text-base font-bold text-white">{member.name}</h3>
      <p className="text-xs font-mono text-emerald-400">{title}</p>
    </li>
  );
}

/** Short home-page preview: President, Vice President and the Chiefs, linking to the full /team page. */
export function CoreTeamPreview() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success) setMembers(d.members);
        else setFailed(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => (members ? groupTeam(members) : null), [members]);
  const domainLabel = (id: string) => TEAM_DOMAINS.find((d) => d.id === id)?.label ?? id;
  const core = groups ? [...groups.president, ...groups.vicePresident, ...groups.chiefs] : [];

  return (
    <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/[0.06] scroll-mt-20" aria-labelledby="team-heading">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            OUR TEAM
          </div>
          <h2 id="team-heading" className="text-3xl sm:text-4xl font-extrabold text-white">
            Meet the people <span className="text-gradient-emerald">behind Andropedia</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            The core team that runs the club, with the leads, co-leads and members of every domain on the full team page.
          </p>
        </div>

        {!groups && !failed && (
          <p className="text-center text-xs font-mono uppercase tracking-[0.18em] text-slate-400" aria-busy="true">Loading the team...</p>
        )}

        {groups && core.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-5">
            {groups.president.map((m) => <PersonCard key={m.id} member={m} title={POSITION_LABELS.president} />)}
            {groups.vicePresident.map((m) => <PersonCard key={m.id} member={m} title={POSITION_LABELS.vice_president} />)}
            {groups.chiefs.map((m) => <PersonCard key={m.id} member={m} title={`Chief, ${domainLabel(m.domain)}`} />)}
          </ul>
        )}

        {/* Nothing assigned yet (or the list could not load): still give a clear way into the team page. */}
        {((groups && core.length === 0) || failed) && (
          <p className="text-center text-sm text-slate-300">
            {members ? `${members.length} members across ${TEAM_DOMAINS.length} domains.` : "Meet the club's members, leads and chiefs."}
          </p>
        )}

        <div className="flex justify-center">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-panel text-sm font-semibold text-white hover:border-emerald-500/40 transition-colors"
            data-cursor-text="Team"
          >
            Meet the full team <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
