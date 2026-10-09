"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/design/Reveal";
import { CountUp, RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { HEX_DOMAINS } from "@/content/home";
import { ACCENTS, DOMAIN_ACCENT, accentVars } from "@/content/accents";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";

const W = 467;
const H = 480;
const TILE_W = 175;
const TILE_H = 151;

// Seven glass hexagons in a honeycomb: Core in the centre, the six domains around it.
const HEX_SRC = "/design/hex/hex-glass.svg";
const CORE_TILE = { x: 146, y: 165 };
const DOMAIN_TILES = [
  { x: 146, y: 0 },    // 0: Technical (Top)
  { x: 292, y: 84 },   // 1: Web (Top-Right)
  { x: 292, y: 247 },  // 2: R&D (Bottom-Right)
  { x: 146, y: 329 },  // 3: Design (Bottom)
  { x: 0, y: 247 },    // 4: Media (Bottom-Left)
  { x: 0, y: 84 },     // 5: PR (Top-Left)
];

const pct = (n: number, total: number) => `${(n / total) * 100}%`;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

/** A hexagon slot with entry animation, continuous floating levitation, and pulsing background neon aura */
function Tile({
  x,
  y,
  delay,
  accentColor,
  children,
  floatDuration = 4,
  floatDelay = 0,
}: {
  x: number;
  y: number;
  delay: number;
  accentColor: string;
  children: React.ReactNode;
  floatDuration?: number;
  floatDelay?: number;
}) {
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
      {/* Hexagon Floating Levitation Animation */}
      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
      >
        {/* Animated Background Neon Glow Pulse for Hexagon */}
        <motion.div
          className="pointer-events-none absolute -inset-4 rounded-full"
          animate={{
            opacity: [0.45, 0.95, 0.45],
            scale: [0.92, 1.12, 0.92],
          }}
          transition={{
            duration: floatDuration * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: floatDelay * 0.5,
          }}
          style={{
            background: `radial-gradient(circle, ${accentColor}55 0%, ${accentColor}20 45%, transparent 70%)`,
            filter: "blur(22px)",
          }}
        />

        {children}
      </motion.div>
    </motion.div>
  );
}

function Person({ member, title, color }: { member: TeamMember; title: string; color: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <StaggerItem as="li" className="glass-inner flex items-center gap-3.5 p-3.5 rounded-xl border border-white/10 bg-white/[0.04]">
      {member.avatar && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={member.avatar} alt="" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-full object-cover border border-white/15" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-mono font-medium text-white" aria-hidden="true">
          {initials(member.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium leading-5 text-white/90">{member.name}</p>
        <p className="truncate text-[13px] font-mono font-medium leading-4" style={{ color }}>{title}</p>
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

  const floatDurations = [3.8, 4.3, 3.5, 4.1, 3.7, 4.5];
  const floatDelays = [0.2, 0.7, 1.2, 0.5, 1.0, 1.6];

  return (
    <section id="team" className="relative isolate overflow-x-clip bg-black px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      {/* Pure black background scaled to fit cleanly within viewport */}
      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10 xl:gap-14">
          {/* Left Column: Proportional Text & Stats fitting page */}
          <div className="space-y-5 xl:space-y-6">
            <Reveal className="space-y-3.5">
              <p className="chip font-mono !text-[11px] !px-3 !py-1 uppercase tracking-[0.14em]">Our Community</p>
              <RevealLines className="font-mono text-[30px] font-bold uppercase leading-[1.08] tracking-tight sm:text-[38px] lg:text-[44px] xl:text-[48px]">
                <span className="text-fade">Meet the people</span>
                <span className="text-aurora">behind Andropedia</span>
              </RevealLines>
              <p className="max-w-[480px] text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
                A collective of developers, designers, researchers, and creators pushing boundaries across SRMIST and shipping real-world software.
              </p>
            </Reveal>

            {/* Proportional Stat Section */}
            <Reveal delay={0.1} className="flex items-baseline gap-4">
              <span className="text-aurora font-mono text-[56px] font-black leading-none tracking-[-3px] sm:text-[68px] lg:text-[76px]">
                {members ? <CountUp value={String(members.length)} duration={1.8} /> : "48+"}
              </span>
              <div className="space-y-0.5">
                <p className="font-mono text-[15px] font-bold uppercase tracking-wider text-white sm:text-[17px]">Active Members</p>
                <p className="text-[12px] text-white/50 sm:text-[13px]">Across {TEAM_DOMAINS.length} specialised technical domains</p>
              </div>
            </Reveal>

            {/* Compact domain badges */}
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-2">
                {HEX_DOMAINS.map((d) => (
                  <span key={d.id} className="chip-accent font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5">
                    {d.title}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Core Team Preview (if available) */}
            {core.length > 0 && (
              <Reveal delay={0.18}>
                <Stagger as="ul" className="grid gap-2 sm:grid-cols-2 max-w-[500px]" stagger={0.06}>
                  {groups!.president.slice(0, 1).map((m) => (
                    <Person key={m.id} member={m} title={POSITION_LABELS.president} color={ACCENTS.amber.a1} />
                  ))}
                  {groups!.vicePresident.slice(0, 1).map((m) => (
                    <Person key={m.id} member={m} title={POSITION_LABELS.vice_president} color={ACCENTS.purple.a2} />
                  ))}
                </Stagger>
              </Reveal>
            )}

            {/* CTA Button */}
            <Reveal delay={0.22}>
              <Link href="/team" className="btn-glow inline-flex items-center gap-2.5 !px-6 !py-3 font-mono text-[13px] font-bold uppercase tracking-wider" data-cursor-text="Team">
                Meet the full team <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          {/* Right Column: Proportional Honeycomb of Hexagons fitting viewport */}
          <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[490px] xl:max-w-[530px] lg:mx-0" style={{ aspectRatio: `${W} / ${H}` }}>
            {/* Core in center */}
            <Tile
              x={CORE_TILE.x}
              y={CORE_TILE.y}
              delay={0}
              accentColor="#6366f1"
              floatDuration={3.6}
              floatDelay={0}
            >
              <Link
                href="/team#core"
                className="group relative flex h-full w-full items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:z-20"
                style={{
                  ...accentVars(ACCENTS.indigo),
                  backgroundImage: `url(${HEX_SRC})`,
                  backgroundSize: "100% 100%",
                  filter: "drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))",
                }}
                aria-label={`Core: ${core.length} members`}
              >
                <span className="flex flex-col items-center gap-1 px-2">
                  <Crown className="text-a1 h-5 w-5 transition-transform duration-300 group-hover:scale-125 sm:h-7 sm:w-7" aria-hidden="true" />
                  <span className="text-accent font-mono text-[11px] font-bold uppercase tracking-wider sm:text-[14px]">Core</span>
                  <span className="text-a2 font-mono text-[11px] font-bold sm:text-[13px]">{members ? core.length : "–"}</span>
                </span>
              </Link>
            </Tile>

            {/* 6 domain hexagons */}
            {HEX_DOMAINS.map((d, i) => {
              const t = DOMAIN_TILES[i];
              const Icon = d.icon;
              const count = counts[d.apiDomain];
              const accent = DOMAIN_ACCENT[d.apiDomain];
              return (
                <Tile
                  key={d.id}
                  x={t.x}
                  y={t.y}
                  delay={0.25 + i * 0.09}
                  accentColor={accent.a1}
                  floatDuration={floatDurations[i % floatDurations.length]}
                  floatDelay={floatDelays[i % floatDelays.length]}
                >
                  <Link
                    href={`/team#${TEAM_DOMAINS.find((x) => x.id === d.apiDomain)?.slug ?? ""}`}
                    className="group relative flex h-full w-full items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:z-20"
                    style={{
                      ...accentVars(accent),
                      backgroundImage: `url(${HEX_SRC})`,
                      backgroundSize: "100% 100%",
                      filter: `drop-shadow(0 0 20px ${accent.a1}66)`,
                    }}
                    aria-label={`${d.title}: ${count ?? 0} members`}
                  >
                    <span className="flex flex-col items-center gap-1 px-2">
                      <Icon className="text-a1 h-5 w-5 transition-transform duration-300 group-hover:scale-125 sm:h-7 sm:w-7" aria-hidden="true" />
                      <span className="text-accent font-mono text-[11px] font-bold uppercase tracking-wider sm:text-[14px]">{d.apiDomain}</span>
                      <span className="text-a2 font-mono text-[11px] font-bold sm:text-[13px]">{count ?? "–"}</span>
                    </span>
                  </Link>
                </Tile>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

