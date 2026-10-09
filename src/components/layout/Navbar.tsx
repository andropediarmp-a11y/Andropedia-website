"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, LogOut, Terminal } from "lucide-react";
import { ACCENTS, accentVars, type Accent } from "@/content/accents";
import { RotaryDial } from "./RotaryDial";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

// A hidden navigation: no bar. The "Andropedia" wordmark goes home and the Recruitment link sits in the
// top-right corner. The menu is the lower half of a rotary phone dial hanging from the top-centre of the
// screen: a slim handle shows there, and hovering it (or the logo card, or tapping, or keyboard focus) drops
// the dial down. Every page is a numbered hole: press and hold one, pull it round to the finger stop and let
// go to dial that page. Plain links under the dial do the same for keyboards.

interface MenuItem {
  name: string;
  href: string;
  accent: Accent;
}

const ITEMS: MenuItem[] = [
  { name: "Home", href: "/", accent: ACCENTS.blue },
  { name: "Domains", href: "/#domains", accent: ACCENTS.teal },
  { name: "Events", href: "/events", accent: ACCENTS.purple },
  { name: "Projects", href: "/projects", accent: ACCENTS.pink },
  { name: "Team", href: "/team", accent: ACCENTS.amber },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { currentUser, logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragging = useRef(false);
  const open = hovered || pinned;

  const close = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setHovered(false);
    setPinned(false);
  }, []);

  const enter = () => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  };
  const leave = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      if (!dragging.current) setHovered(false);
    }, 200);
  };

  // Escape and a click or tap anywhere else close the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: PointerEvent) => {
      const inside = (el: HTMLElement | null) => el?.contains(e.target as Node);
      if (!inside(cardRef.current) && !inside(dialRef.current)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  const portalItem: MenuItem = currentUser
    ? { name: "Portal", href: getPortalDestinationForUser(currentUser), accent: ACCENTS.coral }
    : { name: "Portal login", href: "/portal/login", accent: ACCENTS.coral };
  const items = [...ITEMS, portalItem];

  // Home always lands on the hero: from another page it opens "/", and on the home page itself it jumps back to the top.
  const isHome = (href: string) => href === "/";
  const jumpToHero = () => window.scrollTo({ top: 0, behavior: "instant" });
  const goTo = (href: string) => {
    close();
    if (isHome(href) && pathname === "/") jumpToHero();
    else router.push(href);
  };

  const handleLogout = async () => {
    await logout(); // ends the server session, then clears local state
    close();
    router.push("/");
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex items-start justify-between px-4 pt-3 sm:px-6 sm:pt-4">
        {/* ---------- left: logo card (also opens the dial) and the wordmark ---------- */}
        <div ref={cardRef} className="pointer-events-auto relative flex items-center gap-3" onMouseEnter={enter} onMouseLeave={leave}>
          <button
            type="button"
            onClick={() => {
              if (pinned) close();
              else setPinned(true);
            }}
            onFocus={() => setHovered(true)}
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="site-menu"
            aria-label="Site menu"
            data-cursor-text="Menu"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] shadow-[inset_0_0_20px_rgba(204,215,255,0.08)] backdrop-blur-[12px] transition-colors hover:border-white/40 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            <Terminal className="h-5 w-5 text-white transition-transform group-hover:scale-110" aria-hidden="true" />
            <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-300 via-blue-400 to-fuchsia-400 opacity-80" />
          </button>

          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                jumpToHero();
              }
              close();
            }}
            className="rounded-md p-1 text-[18px] font-bold leading-none tracking-[-0.9px] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.65)]"
            data-cursor-text="Home"
            aria-label="Andropedia home"
          >
            Andropedia
          </Link>
        </div>

        {/* ---------- right: recruitment ---------- */}
        <Link href="/join" className="btn-glass pointer-events-auto" data-cursor-text="Apply">
          <span className="hidden sm:inline">Recruitment 2026 is open</span>
          <span className="sm:hidden">Recruitment open</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ---------- centre: the half dial, with a slim handle that peeks out when it is closed ---------- */}
      <div ref={dialRef} className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2" onMouseEnter={enter} onMouseLeave={leave}>
        {!open && (
          <button
            type="button"
            onClick={() => setPinned(true)}
            onFocus={() => setHovered(true)}
            aria-label="Open the dial menu"
            aria-haspopup="true"
            aria-controls="site-menu"
            data-cursor-text="Dial"
            className="group flex h-7 w-36 items-start justify-center rounded-b-full border border-t-0 border-white/20 bg-white/[0.06] pt-1.5 shadow-[inset_0_0_20px_rgba(204,215,255,0.08)] backdrop-blur-[12px] transition-all hover:h-9 hover:border-white/40 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            {/* six tiny holes: a hint of what is inside */}
            <span aria-hidden="true" className="flex items-center gap-1.5">
              {items.map((item) => (
                <span key={item.name} className="h-1.5 w-1.5 rounded-full opacity-80 transition-opacity group-hover:opacity-100" style={{ background: item.accent.a1 }} />
              ))}
            </span>
          </button>
        )}

        <AnimatePresence>
          {open && (
            <motion.nav
              id="site-menu"
              aria-label="Main"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -60, scale: 0.9 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.8 }}
              style={{ transformOrigin: "top center" }}
            >
              <RotaryDial
                items={items}
                onDragChange={(d) => {
                  dragging.current = d;
                }}
                onSelect={(item) => goTo(item.href)}
              />
              <p className="mt-2 text-center text-[11px] leading-4 text-white/45">Hold a number, pull it round to the stop, then let go.</p>

              {/* the same pages as plain links: for keyboards, screen readers and anyone who prefers to just click */}
              <ul className="mx-auto mt-2 grid w-[min(92vw,380px)] grid-cols-3 gap-x-1 gap-y-0.5 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
                {items.map((item, i) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (isHome(item.href) && pathname === "/") {
                          e.preventDefault();
                          jumpToHero();
                        }
                        close();
                      }}
                      style={accentVars(item.accent)}
                      data-cursor-text={item.name}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[12.5px] font-medium text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]" style={{ borderColor: "var(--a1-line)", color: "var(--a2)" }}>
                        {i + 1}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
                {currentUser && (
                  <li className="col-span-3 border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[12.5px] font-medium text-white/60 hover:bg-white/[0.07] hover:text-white"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Log out
                    </button>
                  </li>
                )}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
