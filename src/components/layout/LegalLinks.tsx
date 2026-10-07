"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { PRIVACY, TERMS, type LegalDoc } from "@/content/legal";

const DOCS: Record<LegalDoc["slug"], LegalDoc> = { terms: TERMS, privacy: PRIVACY };

/** Footer links that open the Terms and Privacy Policy as a square card over a blurred page. */
export function LegalLinks() {
  const [open, setOpen] = useState<LegalDoc["slug"] | null>(null);
  const doc = open ? DOCS[open] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const linkClass = "transition-colors hover:text-white focus-visible:text-white";

  return (
    <>
      <ul className="flex items-center gap-4">
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => setOpen("terms")} className={linkClass} data-cursor-text="Read">
            Terms of Service
          </button>
        </li>
        <li className="h-4 w-px bg-white/10" aria-hidden="true" />
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => setOpen("privacy")} className={linkClass} data-cursor-text="Read">
            Privacy Policy
          </button>
        </li>
      </ul>

      <AnimatePresence>
        {doc && (
          <motion.div
            key="legal-backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={doc.title}
              className="glass-card relative flex aspect-square w-[min(94vw,600px)] flex-col overflow-hidden p-6 text-left sm:p-8"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 40% at 50% 0%, rgba(51,149,255,0.16), transparent 75%)" }} />
              <button
                type="button"
                onClick={() => setOpen(null)}
                autoFocus
                aria-label="Close"
                className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative pr-10">
                <div className="mb-3 flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium" role="tablist" aria-label="Legal documents">
                  {(["terms", "privacy"] as const).map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      role="tab"
                      aria-selected={open === slug}
                      onClick={() => setOpen(slug)}
                      className={`rounded-full px-3 py-1 transition-colors ${open === slug ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
                    >
                      {DOCS[slug].title}
                    </button>
                  ))}
                </div>
                <h2 className="text-2xl font-semibold leading-tight text-white">{doc.title}</h2>
                <p className="mt-1 text-xs text-white/45">Last updated {doc.updated}</p>
              </div>

              <div className="relative mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-2">
                <p className="text-sm leading-6 text-white/75">{doc.intro}</p>
                {doc.sections.map((s, i) => (
                  <section key={s.heading} className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">{i + 1}. {s.heading}</h3>
                    {s.body.map((b, j) =>
                      typeof b === "string" ? (
                        <p key={j} className="text-[13px] leading-6 text-white/65">{b}</p>
                      ) : (
                        <ul key={j} className="list-disc space-y-1 pl-5 text-[13px] leading-6 text-white/65 marker:text-white/30">
                          {b.list.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      )
                    )}
                  </section>
                ))}
              </div>

              <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
                <span>Andropedia Technology Council</span>
                <Link href={`/${doc.slug}`} onClick={() => setOpen(null)} className="inline-flex items-center gap-1 hover:text-white">
                  Open as a page <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
