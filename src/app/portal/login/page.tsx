"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, ArrowRight, AlertCircle, ShieldCheck, Sparkles, BarChart3, Lock } from "lucide-react";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const user = await login(email);
    if (user) {
      router.push(getPortalDestinationForUser(user));
    } else {
      setErrorMsg("The email or access key is not valid for a club account.");
      setLoading(false);
    }
  };

  const perks = [
    { icon: ShieldCheck, text: "Verified member access" },
    { icon: BarChart3, text: "Live leaderboard insights" },
    { icon: Lock, text: "Secure sprint workspace" },
  ];

  return (
    <div className="min-h-screen bg-[#050b16] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.17),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.16),transparent_30%)]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-[32px] border border-sky-400/15 bg-[#0a1322]/80 backdrop-blur-xl shadow-[0_30px_120px_rgba(3,7,18,0.9)]"
      >
        <div className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 border-r border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.72),rgba(8,14,22,0.92))]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Member Portal
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black leading-tight text-white">
                Build smarter.<br />
                <span className="text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 bg-clip-text">Perform louder.</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Access sprint evaluations, weekly submissions, and leaderboards from a secure club workspace designed for ambitious builders.
              </p>
            </div>

            <div className="space-y-3">
              {perks.map(({ icon: Icon, text }, idx) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + idx * 0.1 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-200">{text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4 text-sm text-slate-200">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-slate-400">
              <span>System status</span>
              <span className="text-emerald-300">Online</span>
            </div>
            <div className="flex items-center gap-2 text-base font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
              Sprint 4 dashboard active
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 xl:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel rounded-[28px] p-6 sm:p-8"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-emerald-500/20 border border-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                <Terminal className="h-7 w-7 text-cyan-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-xs text-slate-400 font-mono tracking-[0.18em] uppercase">Andropedia club access</p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleStandardLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">College Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="name@andropedia.club"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter access key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.3)] transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                <span>{loading ? "Authenticating..." : "Enter Member Portal"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
