"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

// Shown when a page throws while rendering. `reset` retries the render.
export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 text-slate-100">
      <div role="alert" className="glass-panel w-full max-w-md rounded-3xl border border-rose-500/30 p-8 text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10">
          <TriangleAlert className="h-6 w-6 text-rose-300" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-slate-300">
          This page hit an unexpected problem. Nothing you submitted was lost. Try again, or head back home.
        </p>
        {error.digest && <p className="text-[11px] font-mono text-slate-400">Reference: {error.digest}</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">
            Try again
          </button>
          <Link href="/" className="glass-panel rounded-xl px-5 py-3 text-sm text-slate-200 hover:text-white">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
