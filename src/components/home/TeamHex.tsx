"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { CountUp, RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { MemberModal, type Selected } from "@/components/team/MemberProfile";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { HEX_DOMAINS } from "@/content/home";
import { ACCENTS, DOMAIN_ACCENT, accentVars, type Accent } from "@/content/accents";
import { POSITION_LABELS, TEAM_DOMAINS, groupTeam, type TeamMember } from "@/lib/team";
import "./team-hex.css";

// "Customers" frame from the design: a big stat, a honeycomb of glass hexagons and the core team.
// Hovering (or focusing, or tapping on a phone) a hexagon opens a popover about that domain.

const W = 630;
const H = 560;
const TILE_W = 175;
const TILE_H = 151;

// Seven hexagons in a honeycomb: Core in the centre, the six domains around it (R&D included: members move there after joining).
const CORE_TILE = { x: 309, y: 233 };
const DOMAIN_TILES = [
  { x: 312, y: 67 },
  { x: 456, y: 153 },
  { x: 455, y: 317 },
  { x: 309, y: 396 },
  { x: 164, y: 314 },
  { x: 165, y: 151 },
];

type Place = "above" | "below" | "left" | "right";
/** Where each popover prefers to open, then what to try if that would clip. */
const CORE_PREF: Place[] = ["below", "above", "right", "left"];
const DOMAIN_PREF: Record<string, Place[]> = {
  Technical: ["above", "below", "right", "left"],
  Web: ["right", "above", "below", "left"],
  "R&D": ["below", "above", "right", "left"],
  Design: ["above", "below", "left", "right"],
  Media: ["below", "above", "left", "right"],
  PR: ["above", "below", "left", "right"],
};

const POP_W = 268;
const POP_H = 220;
const EDGE = 8;

/** The first placement whose popover stays inside the viewport. Left and right need roughly 1280px or more. */
function choosePlace(el: HTMLElement, prefs: Place[]): { place: Place; shift: number } {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const w = vw <= 700 ? 220 : POP_W;
  const cx = r.left + r.width / 2;
  const fits: Record<Place, boolean> = {
    right: r.right - 6 + POP_W <= vw - EDGE,
    left: r.left + 6 - POP_W >= EDGE,
    above: r.top - POP_H >= 72, // keeps clear of the fixed navbar
    below: true,
  };
  const place = prefs.find((p) => fits[p]) ?? (r.top > 360 ? "above" : "below");
  // Above or below: slide the card sideways so it never leaves the screen (the arrow stays on the hexagon).
  const shift = Math.max(EDGE - (cx - w / 2), Math.min(0, vw - EDGE - (cx + w / 2)));
  return { place, shift: place === "above" || place === "below" ? Math.round(shift) : 0 };
}

const pct = (n: number, total: number) => `${(n / total) * 100}%`;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

const GRADIENTS = [
  "linear-gradient(135deg,#3395ff,#af52de)",
  "linear-gradient(135deg,#ff5fa2,#ffb020)",
  "linear-gradient(135deg,#2dd4bf,#3395ff)",
  "linear-gradient(135deg,#af52de,#ff5fa2)",
  "linear-gradient(135deg,#ffb020,#ff6b57)",
  "linear-gradient(135deg,#7978de,#2dd4bf)",
];
const gradientFor = (name: string) => GRADIENTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % GRADIENTS.length];

/** Photo with an initials fallback, used in avatar stacks and person tiles. */
function Face({ member, imgAlt = "" }: { member: TeamMember; imgAlt?: string }) {
  const [failed, setFailed] = useState(false);
  if (member.avatar && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img loading="lazy" decoding="async" src={member.avatar} alt={imgAlt} onError={() => setFailed(true)} />;
  }
  return <span className="contents" aria-hidden="true">{initials(member.name)}</span>;
}

/** A hexagon slot. It flies in from the centre tile and settles into place when the honeycomb scrolls into view. */
function Slot({ x, y, delay, children }: { x: number; y: number; delay: number; children: React.ReactNode }) {
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

interface HexInfo {
  key: string;
  label: string;
  href: string;
  blurb: string;
  accent: Accent;
  icon: React.ComponentType<{ className?: string }>;
  count: number | undefined;
  people: TeamMember[];
  prefs: Place[];
  cta: string;
}

interface HexProps {
  info: HexInfo;
  pos: { x: number; y: number };
  delay: number;
  open: boolean;
  onToggle: (key: string | null) => void;
}

/** One hexagon plus its popover. Hover and keyboard focus are pure CSS; a tap on a phone is handled here. */
function Hex({ info, pos, delay, open, onToggle }: HexProps) {
  const [placed, setPlaced] = useState<{ place: Place; shift: number }>({ place: info.prefs[0], shift: 0 });
  const place = (el: HTMLElement) => setPlaced(choosePlace(el, info.prefs));
  const Icon = info.icon;
  const shown = info.people.slice(0, 4);
  const more = (info.count ?? info.people.length) - shown.length;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia("(hover: none)").matches) return; // mouse: the link just goes to the team page
    e.preventDefault();
    place(e.currentTarget.closest(".th-slot") as HTMLElement);
    onToggle(open ? null : info.key);
  };

  return (
    <Slot x={pos.x} y={pos.y} delay={delay}>
      <div
        className="th-slot h-full w-full"
        data-place={placed.place}
        data-open={open || undefined}
        style={{ ...accentVars(info.accent), "--shift": `${placed.shift}px` } as CSSProperties}
        onPointerEnter={(e) => place(e.currentTarget)}
        onFocus={(e) => place(e.currentTarget)}
      >
        <Link
          href={info.href}
          onClick={onClick}
          className="th-link th-hexwrap focus-visible:outline-none"
          aria-label={`${info.label}: ${info.count ?? 0} members`}
          aria-expanded={open}
        >
          <span className="th-hex">
            <span className="th-hexin">
              <Icon className="th-ic text-a1 h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
              <span className="text-accent text-[10px] font-semibold leading-3 sm:text-[14px] sm:leading-5">{info.label}</span>
              <span className="text-a2 text-[10px] leading-3 sm:text-[12px] sm:leading-[18px]">{info.count ?? "–"}</span>
            </span>
          </span>
        </Link>

        <div className="th-pop" role="group" aria-label={`About ${info.label}`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border text-a1" style={{ borderColor: "var(--a1-line)", background: "var(--a1-soft)" }}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h4 className="text-fade-card m-0 text-[18px] font-semibold leading-[22px]">{info.label}</h4>
              <small className="text-[12px] text-white/50">{info.count ?? 0} {info.count === 1 ? "member" : "members"}</small>
            </div>
          </div>
          <p className="my-2.5 text-[13px] leading-5 text-white/70">{info.blurb}</p>
          {shown.length > 0 && (
            <div className="th-stack" aria-hidden="true">
              {shown.map((m) => (
                <span key={m.id} className="th-av" style={{ background: gradientFor(m.name) }}><Face member={m} /></span>
              ))}
              {more > 0 && <span className="th-av more">+{more}</span>}
            </div>
          )}
          <Link href={info.href} className="text-a1 inline-flex items-center gap-1.5 rounded text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
            {info.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Slot>
  );
}

interface TileProps {
  member: TeamMember;
  title: string;
  accent: Accent;
  big?: boolean;
  onSelect: (s: Selected) => void;
}

/** Portrait card. Hover or focus slides up the bio and links; the "View profile" button opens the profile modal. */
function PersonTile({ member, title, accent, big, onSelect }: TileProps) {
  const select = () => onSelect({ member, title, accent });
  const bio = member.bio?.trim() || `${title} at Andropedia.`;
  return (
    <StaggerItem as="li">
    <article className={`th-tile ${big ? "big" : ""}`} style={accentVars(accent)} onClick={select}>
      <span className="th-halo" aria-hidden="true" />
      {big && (
        <span className="th-crown" aria-hidden="true"><Crown className="h-4 w-4" /></span>
      )}
      <div className="th-body">
        <div className="th-photo">
          <span className="th-photo-in" style={{ background: gradientFor(member.name) }}>
            <Face member={member} />
          </span>
          <span className="th-shine" aria-hidden="true" />
        </div>
        <div className="th-meta">
          <h3>{member.name}</h3>
          <p className="th-role">{title}</p>
        </div>
      </div>
      <div className="th-peek">
        <p>{bio}</p>
        <div className="th-peek-row" onClick={(e) => e.stopPropagation()}>
          {member.github && (
            <a href={member.github} target="_blank" rel="noreferrer" className="th-soc" aria-label={`${member.name} on GitHub`}>
              <GithubIcon className="h-3.5 w-3.5" />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" className="th-soc" aria-label={`${member.name} on LinkedIn`}>
              <LinkedinIcon className="h-3.5 w-3.5" />
            </a>
          )}
          <button type="button" className="th-view" onClick={select} aria-label={`View ${member.name}'s profile`}>
            View profile <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
    </StaggerItem>
  );
}

export function TeamHex() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);

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

  // A tapped popover closes on Escape or a tap anywhere else.
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenKey(null);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".th-slot")) setOpenKey(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [openKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (members ?? []).forEach((m) => (c[m.domain] = (c[m.domain] ?? 0) + 1));
    return c;
  }, [members]);
  const groups = useMemo(() => (members ? groupTeam(members) : null), [members]);
  const core = useMemo(() => (groups ? [...groups.president, ...groups.vicePresident, ...groups.chiefs] : []), [groups]);
  const domainLabel = (id: string) => TEAM_DOMAINS.find((d) => d.id === id)?.label ?? id;

  const coreInfo: HexInfo = {
    key: "core",
    label: "Core",
    href: "/team#core",
    blurb: "President, Vice President and the domain chiefs.",
    accent: ACCENTS.indigo,
    icon: Crown,
    count: members ? core.length : undefined,
    people: core,
    prefs: CORE_PREF,
    cta: "Meet the Core team",
  };
  const domainInfos: HexInfo[] = HEX_DOMAINS.map((d) => {
    const td = TEAM_DOMAINS.find((x) => x.id === d.apiDomain);
    const people = (members ?? [])
      .filter((m) => m.domain === d.apiDomain)
      .sort((a, b) => Number(Boolean(b.avatar)) - Number(Boolean(a.avatar)));
    return {
      key: d.id,
      label: d.apiDomain,
      href: `/team#${td?.slug ?? ""}`,
      blurb: td?.blurb ?? d.subtitle,
      accent: DOMAIN_ACCENT[d.apiDomain],
      icon: d.icon,
      count: counts[d.apiDomain],
      people,
      prefs: DOMAIN_PREF[d.apiDomain] ?? ["below", "above", "right", "left"],
      cta: `Meet the ${d.apiDomain} team`,
    };
  });

  const tileProps = { onSelect: (s: Selected) => setSelected(s) };

  return (
    <section id="team" className="relative isolate overflow-x-clip bg-black px-5 py-24 sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[12%] h-[70%] opacity-60" style={{ backgroundImage: "url(/design/bg/spiral.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <GridLines variant="customers" />
      <BlurOrb variant="customers" size={613} opacity={0.5} position={{ left: "50%", top: "52%" }} />
      <BlurOrb variant="customers-soft" size={600} opacity={0.3} position={{ left: "50%", top: "52%" }} />

      <div className="relative mx-auto max-w-[900px]">
        <Reveal className="mx-auto flex max-w-[652px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
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
        <div className="th-comb relative mx-auto mt-6 w-full max-w-[610px] sm:mt-2" style={{ aspectRatio: `${W} / ${H}` }}>
          <Hex info={coreInfo} pos={CORE_TILE} delay={0} open={openKey === coreInfo.key} onToggle={setOpenKey} />
          {domainInfos.map((info, i) => (
            <Hex key={info.key} info={info} pos={DOMAIN_TILES[i]} delay={0.25 + i * 0.09} open={openKey === info.key} onToggle={setOpenKey} />
          ))}
        </div>

        {/* Core team */}
        <Reveal className="mt-14 space-y-6">
          {groups && core.length > 0 && (
            <div className="th-roster space-y-4">
              {(groups.president.length > 0 || groups.vicePresident.length > 0) && (
                <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2" stagger={0.07}>
                  {groups.president.map((m) => <PersonTile key={m.id} member={m} big title={POSITION_LABELS.president} accent={ACCENTS.amber} {...tileProps} />)}
                  {groups.vicePresident.map((m) => <PersonTile key={m.id} member={m} big title={POSITION_LABELS.vice_president} accent={ACCENTS.purple} {...tileProps} />)}
                </Stagger>
              )}
              {groups.chiefs.length > 0 && (
                <Stagger as="ul" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3" stagger={0.07}>
                  {groups.chiefs.map((m) => <PersonTile key={m.id} member={m} title={`Chief, ${domainLabel(m.domain)}`} accent={DOMAIN_ACCENT[m.domain]} {...tileProps} />)}
                </Stagger>
              )}
            </div>
          )}
          <div className="flex justify-center">
            <Link href="/team" className="btn-glass" data-cursor-text="Team">
              Meet the full team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {selected && (
          <MemberModal selected={selected} domainLabel={domainLabel(selected.member.domain)} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
