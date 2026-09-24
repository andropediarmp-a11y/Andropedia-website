"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2, ClipboardCheck } from "lucide-react";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { HackerText } from "@/components/motion/HackerText";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

const memberTools = [
  { icon: ClipboardCheck, title: "Weekly submissions", body: "Share current work with the club review team." },
  { icon: CheckCircle2, title: "Evaluation feedback", body: "Read scores and feedback attached to your submissions." },
  { icon: BarChart3, title: "Member leaderboard", body: "Follow evaluated club work from inside the portal." },
];

export default function LoginPage() {
  const router = useRouter();
  const reduced = useReducedMotion() === true;
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const user = await login(email);
    if (user) {
      router.push(getPortalDestinationForUser(user));
      return;
    }

    setErrorMessage("No registered Andropedia member account was found for that email.");
    setLoading(false);
  };

  return (
    <div className="surface-paper relative min-h-screen overflow-hidden text-text">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] bg-ink lg:block" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-[24%] h-64 w-64 rounded-full border-2 border-brand-blue" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[6%] top-[9%] hidden h-28 w-28 rotate-6 bg-brand-blue lg:block" aria-hidden="true" />

      <header className="relative z-20 border-b border-[var(--color-line-light)] bg-[rgba(245,246,248,0.94)] backdrop-blur-xl">
        <div className="site-container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Andropedia home">
            <AndropediaLogo className="w-[5.5rem]" priority sizes="88px" />
          </Link>
          <Link href="/" className="text-link min-h-11 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to website</Link>
        </div>
      </header>

      <main className="site-container relative z-10 grid min-h-[calc(100svh-5rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.72fr)] lg:gap-20 lg:py-20">
        <motion.section
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-labelledby="member-login-heading"
        >
          <p className="type-label text-brand-blue"><HackerText text="Member access / 009" /></p>
          <h1 id="member-login-heading" className="type-kinetic mt-6 max-w-[10ch] text-[clamp(3.2rem,7vw,7rem)] leading-[0.9]">Welcome back, builders.</h1>
          <p className="type-body-lg mt-7 max-w-[44ch] text-text-muted">Sign in with the email registered to your Andropedia member profile to continue your club work.</p>

          <div className="mt-10 max-w-2xl border-t border-[var(--color-line-light)]">
            {memberTools.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-[var(--color-line-light)] py-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-pale text-brand-blue"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-relaxed text-text-muted">{body}</span><span className="sr-only">Item {index + 1}</span></span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.75, delay: reduced ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[var(--radius-media)] border border-[var(--color-line-light)] bg-paper-strong p-6 shadow-[0_30px_100px_rgba(8,10,13,0.22)] sm:p-9 lg:p-10"
          aria-labelledby="sign-in-heading"
        >
          <p className="type-label text-brand-blue">Registered members</p>
          <h2 id="sign-in-heading" className="type-h2 mt-4">Member login.</h2>
          <p className="type-body mt-4 text-text-muted">Use the exact email associated with your member account.</p>

          {errorMessage && (
            <div className="mt-7 flex items-start gap-3 border-l-2 border-[var(--color-status-error)] bg-red-50 p-4 text-sm text-[var(--color-status-error)]" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <label className="block">
              <span className="type-label text-text-muted">Member email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                className="mt-2 min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-line-light)] bg-paper px-4 py-3 text-base text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-brand-blue focus:ring-2 focus:ring-[rgba(66,115,228,0.18)]"
                placeholder="you@college.edu"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">
              {loading ? "Checking member account…" : "Enter member portal"}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--color-line-light)] pt-6">
            <p className="text-sm leading-relaxed text-text-muted">Not a member yet? <Link href="/join" className="text-link">Open recruitment <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
