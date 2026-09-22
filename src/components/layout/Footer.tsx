import Link from "next/link";
import { Terminal, Heart, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, DiscordIcon, TwitterIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  const domains = [
    { name: "Technical", href: "/#domains" },
    { name: "Web Development", href: "/#domains" },
    { name: "R&D / AI Labs", href: "/#domains" },
    { name: "Design & UX", href: "/#domains" },
    { name: "Media & VFX", href: "/#domains" },
    { name: "Public Relations", href: "/#domains" },
  ];

  const quickLinks = [
    { name: "Projects Showcase", href: "/#projects" },
    { name: "Club Hackathons", href: "/#events" },
    { name: "Meet the Team", href: "/#team" },
    { name: "Join Recruitment", href: "/join" },
    { name: "Member Portal", href: "/portal/dashboard" },
    { name: "Member Login", href: "/portal/login" },
  ];

  return (
    <footer className="bg-[#05080d] border-t border-white/[0.06] text-slate-400 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-xl tracking-wider text-white">ANDROPEDIA</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier student technology society driving innovation, competitive algorithmic mastery, 
              open-source breakthroughs, and interdisciplinary engineering.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Domains */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Domains</h3>
            <ul className="space-y-2.5 text-sm">
              {domains.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-emerald-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Cycle Stats */}
          <div className="space-y-3 bg-slate-900/50 p-5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold text-sm">Club Status</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-300 font-mono font-medium">Sprint 4 Active</span>
            </div>
            <p className="text-xs text-slate-400">
              Club members can sign in to access their private sprint workspace.
            </p>
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-1"
            >
              Member Login &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Andropedia Club. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with passion by</span>
            <span className="text-emerald-400 font-medium">Andropedia Tech Council</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
