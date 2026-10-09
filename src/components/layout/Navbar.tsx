"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, LogOut, Terminal } from "lucide-react";
import { ACCENTS, accentVars, type Accent } from "@/content/accents";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

// A hidden navigation: no bar. The "Andropedia" wordmark goes home, a small glass logo card opens
// the menu (on hover, keyboard focus or tap), and "Join now" sits alone in the top-right corner.

interface MenuItem {
  name: string;
  hint: string;
  href: string;
  accent: Accent;
}

const ITEMS: MenuItem[] = [
  { name: "About", hint: "Who we are", href: "/about", accent: ACCENTS.blue },
  { name: "Domains", hint: "Six places to build", href: "/#domains", accent: ACCENTS.teal },
  { name: "Events", hint: "Hackathons and workshops", href: "/events", accent: ACCENTS.purple },
  { name: "Projects", hint: "What we have shipped", href: "/projects", accent: ACCENTS.pink },
  { name: "Team", hint: "The people behind it", href: "/team", accent: ACCENTS.amber },
];

export function Navbar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { currentUser, logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const open = hovered || pinned;

  const close = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setHovered(false);
    setPinned(false);
  }, []);

  // Escape and a click or tap anywhere else close the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  const portalItem: MenuItem = currentUser
    ? { name: "Portal", hint: `Signed in as ${currentUser.name.split(" ")[0]}`, href: getPortalDestinationForUser(currentUser), accent: ACCENTS.coral }
    : { name: "Portal login", hint: "Members only", href: "/portal/login", accent: ACCENTS.coral };
  const items = [...ITEMS, portalItem];

  const handleLogout = async () => {
    await logout(); // ends the server session, then clears local state
    close();
    router.push("/");
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex items-start justify-between px-4 pt-3 sm:px-6 sm:pt-4">
        <div
          ref={wrapRef}
          className="pointer-events-auto relative flex items-center gap-3"
          onMouseEnter={() => {
            clearTimeout(leaveTimer.current);
            setHovered(true);
          }}
          onMouseLeave={() => {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = setTimeout(() => setHovered(false), 180);
          }}
        >
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
            onClick={close}
            className="rounded-md p-1 text-[18px] font-bold leading-none tracking-[-0.9px] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.65)]"
            data-cursor-text="Home"
            aria-label="Andropedia home"
          >
            Andropedia
          </Link>

          <AnimatePresence>
            {open && (
              <motion.nav
                id="site-menu"
                aria-label="Main"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96, filter: "blur(6px)" }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top left" }}
                className="absolute left-0 top-full mt-3 w-[min(92vw,340px)] overflow-hidden rounded-3xl border border-white/15 bg-black/70 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(204,215,255,0.06)] backdrop-blur-2xl"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(51,149,255,0.35),transparent_70%)]" />
                <ul className="relative">
                  {items.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={reduce ? false : { opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduce ? 0 : 0.04 + i * 0.045, duration: 0.25, ease: "easeOut" }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        style={accentVars(item.accent)}
                        data-cursor-text={item.name}
                        className="group/item relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                      >
                        <span className="font-mono text-[11px] tabular-nums text-white/35 transition-colors group-hover/item:text-[var(--a2)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-semibold leading-tight tracking-[-0.4px] text-white transition-transform duration-200 group-hover/item:translate-x-1">{item.name}</span>
                          <span className="block truncate text-[12px] leading-4 text-white/45">{item.hint}</span>
                        </span>
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--a1)] opacity-60 shadow-[0_0_10px_var(--a1)] transition-all group-hover/item:scale-150 group-hover/item:opacity-100" />
                        <ArrowUpRight className="h-4 w-4 -translate-x-1 text-white/0 transition-all group-hover/item:translate-x-0 group-hover/item:text-[var(--a2)]" aria-hidden="true" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="relative mt-1 flex w-full items-center gap-2 rounded-2xl border-t border-white/10 px-3 py-2.5 text-left text-[13px] font-medium text-white/60 hover:bg-white/[0.07] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                )}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <Link href="/join" className="btn-glass pointer-events-auto" data-cursor-text="Join">
          Join now
        </Link>
      </div>
    </header>
  );
}
