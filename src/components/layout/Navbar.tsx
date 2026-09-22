"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Terminal, 
  Trophy, 
  Menu, 
  X, 
  ArrowRight
} from "lucide-react";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Domains", href: "/#domains" },
    { name: "Team", href: "/#team" },
    { name: "Projects", href: "/#projects" },
    { name: "Events", href: "/#events" },
    ...(currentUser ? [{ name: "Member Portal", href: getPortalDestinationForUser(currentUser), highlight: true }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl bg-[#080b11]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          data-cursor-text="Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-violet-500/20 border border-emerald-500/40 flex items-center justify-center group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-lg shadow-emerald-500/10">
            <Terminal className="w-5 h-5 text-emerald-400 group-hover:rotate-6 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider text-white">ANDROPEDIA</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TECH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Student Technology Club
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  link.highlight
                    ? "text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5 font-semibold"
                    : isActive
                    ? "text-white bg-white/[0.08]"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.highlight && <Trophy className="w-3.5 h-3.5" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href={currentUser ? getPortalDestinationForUser(currentUser) : "/portal/login"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            data-cursor-text="Portal"
          >
            <span>{currentUser ? "Portal" : "Member Login"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href={currentUser ? getPortalDestinationForUser(currentUser) : "/portal/login"}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1"
          >
            <span>{currentUser ? "Portal" : "Member Login"}</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f19] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-white/[0.05] hover:text-emerald-400"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/join"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-emerald-400 hover:bg-emerald-500/10"
            >
              Join the Club
            </Link>
          </div>

        </div>
      )}

    </header>
  );
}
