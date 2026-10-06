"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { HOME_DOMAINS } from "@/content/home";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";

// "Customers" frame from the design: a big stat, a honeycomb of glass hexagons and a short roster.
// Here the hexagons are the six domains with live member counts; the roster is the core team.

const W = 610;
const H = 644;
const TILE_W = 175;
const TILE_H = 151;

// Honeycomb positions from the design (x, y inside a 610 x 644 box).
const DECOR = [
  { x: 309, y: 596, src: "/design/hex/hex-1.svg" },
  { x: 455, y: 517, src: "/design/hex/hex-2.svg" },
  { x: 166, y: 185, src: "/design/hex/hex-3.svg" },
  { x: 309, y: 103, src: "/design/hex/hex-3.svg" },
  { x: 23, y: 267, src: "/design/hex/hex-1.svg" },
];
const DOMAIN_TILES = [
  { x: 165, y: 351, src: "/design/hex/hex-glass.svg" },
  { x: 312, y: 267, src: "/design/hex/hex-glass.svg" },
  { x: 456, y: 353, src: "/design/hex/hex-glass.svg" },
  { x: 309, y: 433, src: "/design/hex/hex-glass.svg" },
  { x: 21, y: 430, src: "/design/hex/hex-6.svg" },
  { x: 164, y: 514, src: "/design/hex/hex-4.svg" },
];

const pct = (n: number, total: number) => `${(n / total) * 100}%`;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function Person({ member, title }: { member: TeamMember; title: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <li className="glass-inner flex items-center gap-4 p-4">
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
        <p className="truncate text-[14px] leading-5 text-white/50">{title}</p>
      </div>
    </li>
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
    <section id="team" className="relative isolate scroll-mt-20 overflow-hidden bg-black px-5 py-24 sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[12%] h-[70%] opacity-60" style={{ backgroundImage: "url(/design/bg/spiral.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <GridLines variant="customers" />
      <BlurOrb variant="customers" size={613} opacity={0.5} position={{ left: "50%", top: "52%" }} />
      <BlurOrb variant="customers-soft" size={600} opacity={0.3} position={{ left: "50%", top: "52%" }} />

      <div className="relative mx-auto max-w-[652px]">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-fade text-[36px] font-medium leading-[1.1] tracking-[-2px] sm:max-w-[305px] sm:text-[50px]">
            Meet the people behind Andropedia
          </h2>
          <div className="flex flex-col sm:items-end">
            <span className="text-fade text-[96px] font-medium leading-none tracking-[-5px] sm:text-[140px] sm:tracking-[-5.6px]" aria-label={members ? `${members.length} members` : "Members"}>
              {members ? members.length : "—"}
            </span>
            <span className="text-[16px] leading-6 text-white/50">Members across {TEAM_DOMAINS.length} domains</span>
          </div>
        </Reveal>

        {/* Honeycomb of domains */}
        <div className="relative mx-auto mt-6 w-full max-w-[610px] sm:-mt-6" style={{ aspectRatio: `${W} / ${H}` }}>
          {DECOR.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={t.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute" style={{ left: pct(t.x, W), top: pct(t.y, H), width: pct(TILE_W, W), height: "auto", aspectRatio: `${TILE_W} / ${TILE_H}` }} />
          ))}
          {HOME_DOMAINS.map((d, i) => {
            const t = DOMAIN_TILES[i];
            const Icon = d.icon;
            const count = counts[d.apiDomain];
            return (
              <Link
                key={d.id}
                href={`/team#${TEAM_DOMAINS.find((x) => x.id === d.apiDomain)?.slug ?? ""}`}
                className="group absolute flex items-center justify-center text-center transition-transform hover:scale-105"
                style={{ left: pct(t.x, W), top: pct(t.y, H), width: pct(TILE_W, W), aspectRatio: `${TILE_W} / ${TILE_H}`, backgroundImage: `url(${t.src})`, backgroundSize: "100% 100%" }}
                aria-label={`${d.title}: ${count ?? 0} members`}
              >
                <span className="flex flex-col items-center gap-0.5 px-2">
                  <Icon className="h-4 w-4 text-white sm:h-6 sm:w-6" aria-hidden="true" />
                  <span className="text-[10px] font-medium leading-3 text-white sm:text-[14px] sm:leading-5">{d.apiDomain}</span>
                  <span className="text-[10px] leading-3 text-white/70 sm:text-[12px] sm:leading-[18px]">{count ?? "–"}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Core team */}
        <Reveal className="mt-10 space-y-6">
          {core.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {groups!.president.map((m) => <Person key={m.id} member={m} title={POSITION_LABELS.president} />)}
              {groups!.vicePresident.map((m) => <Person key={m.id} member={m} title={POSITION_LABELS.vice_president} />)}
              {groups!.chiefs.map((m) => <Person key={m.id} member={m} title={`Chief, ${domainLabel(m.domain)}`} />)}
            </ul>
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
