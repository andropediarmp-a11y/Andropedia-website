"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, MailCheck } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/40 shadow-[inset_0_0_30px_rgba(204,215,255,0.06)] focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-colors";

export default function ForgotPasswordPage() {
  const [registerNo, setRegisterNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerNo }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setSent(true);
      else setErrorMsg(data.error || "Something went wrong. Please try again.");
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-12 text-white sm:px-6">
      <div className="glass-card w-full max-w-md p-6 sm:p-9">
        <div className="mb-7 space-y-1.5 text-center">
          <h1 className="text-aurora text-[28px] font-semibold leading-9 tracking-[-1px]">Forgot password</h1>
          <p className="text-[13px] leading-5 text-white/50">We will email a reset link to the address you registered with.</p>
        </div>

        {sent ? (
          <div role="status" className="space-y-4 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-300" aria-hidden="true" />
            <p className="text-[14px] leading-6 text-white/80">
              If that register number belongs to a member, a reset link is on its way. It works once and expires in 30 minutes.
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-[13px] text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="forgot-regno" className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/60">
                  Register number
                </label>
                <input
                  id="forgot-regno"
                  type="text"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value)}
                  className={`${inputClass} uppercase`}
                  placeholder="RA2511026020025"
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={30}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-glow w-full disabled:opacity-60">
                {loading ? "Sending..." : "Send reset link"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-[13px] text-white/50">
          <Link href="/portal/login" className="text-emerald-300 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
