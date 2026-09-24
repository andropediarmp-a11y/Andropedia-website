"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { DomainType, LeaderboardEntry } from "@/lib/types";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

const domains: Array<"All" | DomainType> = ["All", "Technical", "Web", "R&D", "Design", "Media", "PR"];

export function LeaderboardView({ publicData = false }: { publicData?: boolean }) {
  const [entries,setEntries]=useState<LeaderboardEntry[]>([]);
  const [domain,setDomain]=useState<"All"|DomainType>("All");
  const [query,setQuery]=useState("");
  const [state,setState]=useState<"loading"|"ready"|"error">("loading");

  useEffect(()=>{const controller=new AbortController();const scope=publicData?"&scope=public":"";fetch(`/api/leaderboard?domain=${encodeURIComponent(domain)}${scope}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error("Leaderboard request failed");return r.json();}).then(data=>{setEntries(data.leaderboard||[]);setState("ready");}).catch(error=>{if(error.name!=="AbortError")setState("error");});return()=>controller.abort();},[domain,publicData]);

  const selectDomain = (nextDomain: "All" | DomainType) => {
    if (nextDomain === domain) return;
    setState("loading");
    setDomain(nextDomain);
  };

  const filtered=useMemo(()=>entries.filter(entry=>entry.name.toLowerCase().includes(query.toLowerCase().trim())),[entries,query]);

  return <div>
    <div className="flex flex-col gap-5 border-y border-[var(--color-line-light)] py-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2" aria-label="Filter leaderboard by domain">{domains.map(item=><button key={item} type="button" onClick={()=>selectDomain(item)} aria-pressed={domain===item} className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm ${domain===item?"border-brand-blue bg-brand-blue text-ink":"border-[var(--color-line-light)] hover:border-brand-blue"}`}>{item}</button>)}</div><label className="relative block lg:w-72"><span className="sr-only">Search leaderboard</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search members" className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-light)] bg-paper-strong pl-10 pr-3 text-sm" /></label></div>
    {state==="loading"&&<p className="py-16 text-text-muted" aria-live="polite">Loading standings...</p>}
    {state==="error"&&<div className="py-16"><h2 className="text-2xl font-semibold">Standings are temporarily unavailable.</h2><p className="mt-3 text-text-muted">Please try again later.</p></div>}
    {state==="ready"&&filtered.length===0&&<div className="py-16"><p className="text-xl font-semibold">{entries.length===0&&publicData?"Public standings are awaiting verification.":"No standings match this view."}</p>{entries.length===0&&publicData&&<p className="mt-3 text-text-muted">Official results will appear here after the scoring records are approved for publication.</p>}</div>}
    {state==="ready"&&filtered.length>0&&<div className="overflow-x-auto"><table className="w-full min-w-[46rem] border-collapse text-left"><caption className="sr-only">Andropedia member standings</caption><thead><tr className="border-b border-[var(--color-line-light)] text-left type-label text-text-muted"><th scope="col" className="px-3 py-5">Rank</th><th scope="col" className="px-3 py-5">Member</th><th scope="col" className="px-3 py-5">Domain</th><th scope="col" className="px-3 py-5 text-right">Tasks</th><th scope="col" className="px-3 py-5 text-right">Average</th><th scope="col" className="px-3 py-5 text-right">Total</th></tr></thead><tbody>{filtered.map(entry=><tr key={entry.userId} className="border-b border-[var(--color-line-light)]"><td className="px-3 py-6 font-mono text-sm"><AnimatedNumber value={entry.rank} /></td><th scope="row" className="px-3 py-6 text-lg font-semibold">{entry.name}</th><td className="px-3 py-6 text-sm text-text-muted">{entry.domain}</td><td className="px-3 py-6 text-right font-mono text-sm"><AnimatedNumber value={entry.tasksCompleted} /></td><td className="px-3 py-6 text-right font-mono text-sm"><AnimatedNumber value={entry.avgScore} /></td><td className="px-3 py-6 text-right font-mono text-lg font-semibold text-brand-blue"><AnimatedNumber value={entry.totalScore} /></td></tr>)}</tbody></table></div>}
  </div>;
}
