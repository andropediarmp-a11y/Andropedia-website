"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { motion } from "framer-motion";
import { Reveal } from "@/components/design/Reveal";
import { CountUp, RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { HEX_DOMAINS } from "@/content/home";
import { ACCENTS, DOMAIN_ACCENT, accentVars } from "@/content/accents";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";

// "Customers" frame from the design: a big stat, a honeycomb of glass hexagons and a short roster.
// Here the hexagons are the six domains with live member counts; the roster is the core team.

const W = 630;
const H = 560;
const TILE_W = 175;
const TILE_H = 151;

// Seven glass hexagons in a honeycomb: Core in the centre, the six domains around it (R&D included: members move there after joining).
const HEX_SRC = "/design/hex/hex-glass.svg";
const CORE_TILE = { x: 309, y: 233 };
const DOMAIN_TILES = [
  { x: 312, y: 67 },
  { x: 456, y: 153 },
  { x: 455, y: 317 },
  { x: 309, y: 396 },
  { x: 164, y: 314 },
  { x: 165, y: 151 },
];

const pct = (n: number, total: number) => `${(n / total) * 100}%`;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

/** A hexagon slot. It flies in from the centre tile and settles into place when the honeycomb scrolls into view. */
function Tile({ x, y, delay, children }: { x: number; y: number; delay: number; children: React.ReactNode }) {
  const dx = ((CORE_TILE.x - x) / TILE_W) * 100;
  const dy = ((CORE_TILE.y - y) / TILE_H) * 100;
  return (
    <motion.div
      className="absolute"
      style={{ left: pct(x, W), top: pct(y, H), width: pct(TILE_W, W), aspectRatio: `${TILE_W} / ${TILE_H}` }}
      initial={{ opacity: 0, scale: 0.4, x: `${dx}%`, y: `${dy}%` }}
      whileInView={{ opacity: 1, scale: 1, x: "0%", y: "0%" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Person({ member, title, color }: { member: TeamMember; title: string; color: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <StaggerItem as="li" className="glass-inner flex items-center gap-4 p-4">
      {member.avatar && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={member.avatar} alt="" onError={() => setFailed(true)} className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white" aria-hidden="true">
          {initials(member.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-[16px] leading-6 text-white/80">{member.name}</p>
        <p className="truncate text-[14px] font-medium leading-5" style={{ color }}>{title}</p>
      </div>
    </StaggerItem>
  );
}

export function TeamHex() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setMembers(d.members);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (members ?? []).forEach((m) => (c[m.domain] = (c[m.domain] ?? 0) + 1));
    return c;
  }, [members]);
  const groups = useMemo(() => (members ? groupTeam(members) : null), [members]);
  const core = groups ? [...groups.president, ...groups.vicePresident, ...groups.chiefs] : [];
  const domainLabel = (id: string) => TEAM_DOMAINS.find((d) => d.id === id)?.label ?? id;

  return (
    <section id="team" className="relative isolate overflow-x-clip bg-black px-5 py-24 sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[12%] h-[70%] opacity-60" style={{ backgroundImage: "url(/design/bg/spiral.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <GridLines variant="customers" />
      <BlurOrb variant="customers" size={613} opacity={0.5} position={{ left: "50%", top: "52%" }} />
      <BlurOrb variant="customers-soft" size={600} opacity={0.3} position={{ left: "50%", top: "52%" }} />

      <div className="relative mx-auto max-w-[652px]">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <RevealLines className="text-[36px] font-medium leading-[1.1] tracking-[-2px] sm:max-w-[360px] sm:text-[50px]">
            <span className="text-fade">Meet the people</span>
            <span className="text-aurora">behind Andropedia</span>
          </RevealLines>
          <div className="flex flex-col sm:items-end">
            <span className="text-aurora text-[96px] font-medium leading-none tracking-[-5px] sm:text-[140px] sm:tracking-[-5.6px]" aria-label={members ? `${members.length} members` : "Members"}>
              {members ? <CountUp value={String(members.length)} duration={1.8} /> : "—"}
            </span>
            <span className="text-[16px] leading-6 text-white/50">Members across {TEAM_DOMAINS.length} domains</span>
          </div>
        </Reveal>

        {/* Honeycomb of domains */}
        <div className="relative mx-auto mt-6 w-full max-w-[610px] sm:mt-2" style={{ aspectRatio: `${W} / ${H}` }}>
          <Tile x={CORE_TILE.x} y={CORE_TILE.y} delay={0}>
          <Link
            href="/team#core"
            className="group flex h-full w-full items-center justify-center text-center transition-transform hover:scale-105"
            style={{ ...accentVars(ACCENTS.indigo), backgroundImage: `url(${HEX_SRC})`, backgroundSize: "100% 100%", filter: "drop-shadow(0 0 14px var(--a1-soft))" }}
            aria-label={`Core: ${core.length} members`}
          >
            <span className="flex flex-col items-center gap-0.5 px-2">
              <Crown className="text-a1 h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
              <span className="text-accent text-[10px] font-semibold leading-3 sm:text-[14px] sm:leading-5">Core</span>
              <span className="text-a2 text-[10px] leading-3 sm:text-[12px] sm:leading-[18px]">{members ? core.length : "–"}</span>
            </span>
          </Link>
          </Tile>
          {HEX_DOMAINS.map((d, i) => {
            const t = DOMAIN_TILES[i];
            const Icon = d.icon;
            const count = counts[d.apiDomain];
            const accent = DOMAIN_ACCENT[d.apiDomain];
            return (
              <Tile key={d.id} x={t.x} y={t.y} delay={0.25 + i * 0.09}>
              <Link
                href={`/team#${TEAM_DOMAINS.find((x) => x.id === d.apiDomain)?.slug ?? ""}`}
                className="group flex h-full w-full items-center justify-center text-center transition-transform hover:scale-105"
                style={{ ...accentVars(accent), backgroundImage: `url(${HEX_SRC})`, backgroundSize: "100% 100%", filter: "drop-shadow(0 0 14px var(--a1-soft))" }}
                aria-label={`${d.title}: ${count ?? 0} members`}
              >
                <span className="flex flex-col items-center gap-0.5 px-2">
                  <Icon className="text-a1 h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                  <span className="text-accent text-[10px] font-semibold leading-3 sm:text-[14px] sm:leading-5">{d.apiDomain}</span>
                  <span className="text-a2 text-[10px] leading-3 sm:text-[12px] sm:leading-[18px]">{count ?? "–"}</span>
                </span>
              </Link>
              </Tile>
            );
          })}
        </div>

        {/* Core team */}
        <Reveal className="mt-10 space-y-6">
          {core.length > 0 && (
            <Stagger as="ul" className="grid gap-3 sm:grid-cols-2" stagger={0.07}>
              {groups!.president.map((m) => <Person key={m.id} member={m} title={POSITION_LABELS.president} color={ACCENTS.amber.a1} />)}
              {groups!.vicePresident.map((m) => <Person key={m.id} member={m} title={POSITION_LABELS.vice_president} color={ACCENTS.purple.a2} />)}
              {groups!.chiefs.map((m) => <Person key={m.id} member={m} title={`Chief, ${domainLabel(m.domain)}`} color={DOMAIN_ACCENT[m.domain].a1} />)}
            </Stagger>
          )}
          <div className="flex justify-center">
            <Link href="/team" className="btn-glass" data-cursor-text="Team">
              Meet the full team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
