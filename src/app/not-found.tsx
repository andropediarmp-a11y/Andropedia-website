import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 text-slate-100">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10">
          <Compass className="h-6 w-6 text-emerald-400" aria-hidden="true" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Error 404</p>
        <h1 className="text-2xl font-bold text-white">We couldn&apos;t find that page</h1>
        <p className="text-sm text-slate-300">The link may be old or mistyped. Try one of these instead.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">
            Go home
          </Link>
          <Link href="/join" className="glass-panel rounded-xl px-5 py-3 text-sm text-slate-200 hover:text-white">
            Apply to join
          </Link>
        </div>
      </div>
    </div>
  );
}
