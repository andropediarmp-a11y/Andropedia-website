"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Crown, Shield, Star, X, Briefcase } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { ACCENTS, DOMAIN_ACCENT, accentVars, type Accent } from "@/content/accents";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";

type Size = "large" | "medium" | "compact";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function Avatar({ member, className }: { member: TeamMember; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!member.avatar || failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-300 font-bold`} aria-label={member.name}>
        {initials(member.name)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img loading="lazy" decoding="async" src={member.avatar} alt={member.name} onError={() => setFailed(true)} className={`${className} object-cover`} />
  );
}

function Socials({ member }: { member: TeamMember }) {
  if (!member.github && !member.linkedin) return null;
  const linkClass = "p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors";
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {member.github && (
        <a href={member.github} target="_blank" rel="noreferrer" className={linkClass} aria-label={`${member.name} on GitHub`}>
          <GithubIcon className="w-3.5 h-3.5" />
        </a>
      )}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noreferrer" className={linkClass} aria-label={`${member.name} on LinkedIn`}>
          <LinkedinIcon className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

type Select = (m: TeamMember, title: string | undefined, accent: Accent | undefined) => void;

const hoverSpring = { type: "spring", stiffness: 320, damping: 22 } as const;

/** `title` is the line under the name, e.g. "President" or "Chief, Technical". Click or Enter opens the profile. */
function MemberCard({ member, size, title, className = "", accent, onSelect }: { member: TeamMember; size: Size; title?: string; className?: string; accent?: Accent; onSelect: Select }) {
  const open = () => onSelect(member, title, accent);
  const interactive = {
    role: "button" as const,
    tabIndex: 0,
    "aria-haspopup": "dialog" as const,
    "aria-label": `Open ${member.name}'s profile`,
    onClick: open,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
    whileHover: { y: -6, scale: 1.025 },
    whileTap: { scale: 0.985 },
    transition: hoverSpring,
  };

  if (size === "compact") {
    return (
      <motion.div
        {...interactive}
        className="group dark-card p-4 flex items-center gap-3 cursor-pointer hover:border-white/30 hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
        data-cursor-text="View profile"
      >
        <Avatar member={member} className="w-12 h-12 rounded-xl border border-white/10 shrink-0 text-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white truncate">{member.name}</h4>
          {member.bio && <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{member.bio}</p>}
        </div>
        <Socials member={member} />
      </motion.div>
    );
  }

  const large = size === "large";
  return (
    <motion.div
      {...interactive}
      className={`group glass-card glass-card-sm is-interactive relative flex flex-col items-center text-center cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 ${large ? "p-8 w-full sm:w-80" : "p-6"} ${className}`}
      data-cursor-text="View profile"
      style={accent ? accentVars(accent) : undefined}
    >
      {/* Accent glow that fades in under the cursor */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(60% 50% at 50% 0%, var(--a1-soft, rgba(255,255,255,0.12)), transparent 70%)" }} />
      <Avatar
        member={member}
        className={`${large ? "w-28 h-28 text-3xl" : "w-20 h-20 text-xl"} rounded-2xl border border-white/30 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
      />
      <h3 className={`${large ? "text-xl" : "text-lg"} font-bold text-white mt-4`}>{member.name}</h3>
      {title && <p className="text-a2 mt-1 text-[13px] font-medium leading-5">{title}</p>}
      {member.bio && <p className="text-xs text-slate-400 leading-relaxed mt-3 line-clamp-3">{member.bio}</p>}
      <div className="mt-4"><Socials member={member} /></div>
      <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/0 transition-colors duration-300 group-hover:text-white/70">View profile</span>
    </motion.div>
  );
}

interface Selected { member: TeamMember; title?: string; accent?: Accent }

/** Square profile card over a blurred, dimmed page. Closes on Esc, backdrop click or the X. */
function MemberModal({ selected, domainLabel, onClose }: { selected: Selected; domainLabel: string; onClose: () => void }) {
  const { member, title, accent } = selected;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name}'s profile`}
        className="glass-card relative flex aspect-square w-[min(92vw,520px)] flex-col overflow-hidden p-7 sm:p-9"
        style={accent ? accentVars(accent) : undefined}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 0%, var(--a1-soft, rgba(255,255,255,0.1)), transparent 75%)" }} />
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close profile"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-center gap-5">
          <Avatar member={member} className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl border border-white/30 text-3xl shadow-lg" />
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white">{member.name}</h2>
            {title && <p className="text-a2 mt-1 text-sm font-medium">{title}</p>}
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-white/70">
              <Briefcase className="h-3 w-3" /> {domainLabel}
            </p>
          </div>
        </div>

        <div className="relative mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">About</p>
          <p className="whitespace-pre-line text-sm leading-6 text-white/80">{member.bio || "This member has not added a bio yet."}</p>
        </div>

        <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-white/50">{POSITION_LABELS[member.position ?? "member"]}</span>
          <Socials member={member} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-white/50 text-center py-6 border border-dashed border-white/15 rounded-xl">{children}</p>;
}

function SubHeading({ icon: Icon, children }: { icon: typeof Crown; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
      <Icon className="text-a1 h-3.5 w-3.5" />
      {children}
    </h3>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);
  const select: Select = (member, title, accent) => setSelected({ member, title, accent });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) setMembers(data.members);
        else setLoadError(true);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => (members ? groupTeam(members) : null), [members]);
  const domainLabel = (id: string) => TEAM_DOMAINS.find((d) => d.id === id)?.label ?? id;
  const hasCore = groups && (groups.president.length || groups.vicePresident.length || groups.chiefs.length);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <GridLines variant="hero" />
      <BlurOrb variant="features" size={800} opacity={0.4} position={{ left: "50%", top: "380px" }} />
      <div className="relative max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <div className="chip">
            <Users className="w-3.5 h-3.5" />
            OUR TEAM
          </div>
          <h1 className="text-fade text-[40px] sm:text-[60px] font-medium leading-[1.05] tracking-[-2px] sm:tracking-[-3px]">
            Meet the people of Andropedia
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            The core team that runs the club, and the leads, co-leads and members of every domain.
          </p>
        </header>

        {/* Jump links */}
        <nav aria-label="Team sections" className="sticky top-[60px] z-30 -mx-4 px-4 py-2 bg-black/60 backdrop-blur-xl border-y border-white/10">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {[{ href: "#core", label: "Core" }, ...TEAM_DOMAINS.map((d) => ({ href: `#${d.slug}`, label: d.label }))].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="pill-link !px-3 !py-1 !text-[13px] border border-white/10">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {loadError && (
          <p role="alert" className="text-center text-sm text-amber-300">
            We couldn&apos;t load the team right now. Please refresh in a moment.
          </p>
        )}
        {!groups && !loadError && (
          <p className="text-center text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Loading the team...</p>
        )}

        {groups && (
          <>
            {/* ---------- Core ---------- */}
            <section id="core" className="scroll-mt-32 space-y-8" aria-label="Core team">
              <div className="text-center space-y-1">
                <h2 className="text-aurora text-[36px] sm:text-[50px] font-medium leading-[1.1] tracking-[-2px]">Core team</h2>
                <p className="text-sm text-slate-400">President, Vice President and the Chief of every domain.</p>
              </div>

              {!hasCore && <Empty>The core team will be announced soon.</Empty>}

              {(groups.president.length > 0 || groups.vicePresident.length > 0) && (
                <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-stretch justify-center gap-6">
                  {groups.president.map((m) => (
                    <MemberCard key={m.id} onSelect={select} member={m} size="large" title={POSITION_LABELS.president} accent={ACCENTS.amber} />
                  ))}
                  {groups.vicePresident.map((m) => (
                    <MemberCard key={m.id} onSelect={select} member={m} size="large" title={POSITION_LABELS.vice_president} accent={ACCENTS.purple} />
                  ))}
                </div>
              )}

              {groups.chiefs.length > 0 && (
                <div className="space-y-4">
                  <SubHeading icon={Crown}>Chiefs</SubHeading>
                  <div className="flex flex-wrap justify-center gap-5">
                    {groups.chiefs.map((m) => (
                      <MemberCard key={m.id} onSelect={select} member={m} size="medium" title={`Chief, ${domainLabel(m.domain)}`} className="w-full sm:w-72" accent={DOMAIN_ACCENT[m.domain]} />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ---------- Domains ---------- */}
            {groups.domains.map(({ domain, leads, coLeads, members: regular, total }) => (
              <section key={domain.id} id={domain.slug} className="scroll-mt-32 space-y-6" style={accentVars(DOMAIN_ACCENT[domain.id])} aria-label={`${domain.label} team`}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-accent text-[30px] sm:text-[40px] font-medium leading-[1.1] tracking-[-1.5px]">{domain.label}</h2>
                    <p className="text-sm text-slate-400">{domain.blurb}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{total} {total === 1 ? "member" : "members"}</span>
                </div>

                {total === 0 ? (
                  <Empty>No one is listed in {domain.label} yet.</Empty>
                ) : (
                  <>
                    {leads.length > 0 && (
                      <div className="space-y-3">
                        <SubHeading icon={Shield}>{leads.length > 1 ? "Leads" : "Lead"}</SubHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {leads.map((m) => <MemberCard key={m.id} onSelect={select} member={m} size="medium" title={`${POSITION_LABELS.lead}, ${domain.label}`} accent={DOMAIN_ACCENT[domain.id]} />)}
                        </div>
                      </div>
                    )}
                    {coLeads.length > 0 && (
                      <div className="space-y-3">
                        <SubHeading icon={Star}>{coLeads.length > 1 ? "Co-Leads" : "Co-Lead"}</SubHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {coLeads.map((m) => <MemberCard key={m.id} onSelect={select} member={m} size="medium" title={`${POSITION_LABELS.co_lead}, ${domain.label}`} accent={DOMAIN_ACCENT[domain.id]} />)}
                        </div>
                      </div>
                    )}
                    {regular.length > 0 && (
                      <div className="space-y-3">
                        <SubHeading icon={Users}>Members</SubHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {regular.map((m) => <MemberCard key={m.id} onSelect={select} member={m} size="compact" />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            ))}
          </>
        )}
      </div>
      <AnimatePresence>
        {selected && <MemberModal selected={selected} domainLabel={domainLabel(selected.member.domain)} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
