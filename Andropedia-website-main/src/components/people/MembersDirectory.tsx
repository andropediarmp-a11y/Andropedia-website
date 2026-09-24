"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import type { DomainType, PublicMemberProfile } from "@/lib/types";

const domains: Array<"All" | DomainType> = ["All", "Technical", "Web", "R&D", "Design", "Media", "PR"];

function MemberAvatar({ member }: { member: PublicMemberProfile }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(member.avatar) && !failed;

  return <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden bg-brand-blue-pale text-xl font-semibold text-brand-blue lg:h-24 lg:w-24">{showImage?<Image unoptimized fill sizes="96px" src={member.avatar} alt="" className="object-cover" onError={()=>setFailed(true)} />:<span aria-hidden="true">{member.name.slice(0,1)}</span>}<span className="sr-only">{showImage?`${member.name} profile photo`:`No profile photo for ${member.name}`}</span></div>;
}

export function MembersDirectory() {
  const [members,setMembers]=useState<PublicMemberProfile[]>([]);
  const [query,setQuery]=useState("");
  const [domain,setDomain]=useState<"All"|DomainType>("All");
  const [state,setState]=useState<"loading"|"ready"|"error">("loading");

  useEffect(()=>{const controller=new AbortController(); fetch("/api/members?scope=public",{signal:controller.signal,cache:"no-store"}).then(r=>{if(!r.ok) throw new Error("Member request failed"); return r.json();}).then(data=>{setMembers(data.members||[]);setState("ready");}).catch(error=>{if(error.name!=="AbortError") setState("error");}); return()=>controller.abort();},[]);

  const filtered=useMemo(()=>members.filter(member=>(domain==="All"||member.domain===domain)&&member.name.toLowerCase().includes(query.toLowerCase().trim())),[members,domain,query]);

  if(state==="loading") return <p className="py-16 text-sm text-text-muted" aria-live="polite">Loading public member profiles...</p>;
  if(state==="error") return <div className="border-y border-[var(--color-line-light)] py-12"><h2 className="text-2xl font-semibold">Member profiles are temporarily unavailable.</h2><p className="mt-3 text-text-muted">Please try again later.</p></div>;
  if(members.length===0) return <div className="border-y border-[var(--color-line-light)] py-12"><h2 className="text-2xl font-semibold">The public member directory is being prepared.</h2><p className="mt-3 max-w-xl text-text-muted">Profiles will appear after the roster and public fields are confirmed.</p></div>;

  return <>
    <div className="flex flex-col gap-5 border-y border-[var(--color-line-light)] py-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2" aria-label="Filter members by domain">{domains.map(item=><button key={item} type="button" onClick={()=>setDomain(item)} aria-pressed={domain===item} className={`min-h-11 rounded-[var(--radius-control)] border px-4 text-sm ${domain===item?"border-brand-blue bg-brand-blue text-ink":"border-[var(--color-line-light)] hover:border-brand-blue"}`}>{item}</button>)}</div><label className="relative block lg:w-72"><span className="sr-only">Search members</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search members" className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-light)] bg-paper-strong pl-10 pr-3 text-sm" /></label></div>
    <p className="sr-only" aria-live="polite">{filtered.length} public profiles shown.</p>
    {filtered.length===0?<p className="py-12 text-text-muted">No public profiles match those filters.</p>:<ul className="divide-y divide-[var(--color-line-light)]">{filtered.map(member=><li key={member.id} className="grid gap-5 py-8 sm:grid-cols-[5rem_1fr] lg:grid-cols-[6rem_1fr_12rem]"><MemberAvatar member={member} /><div><h2 className="text-2xl font-semibold tracking-[-0.03em]">{member.name}</h2><p className="type-label mt-2 text-brand-blue">{member.domain}</p>{member.bio&&<p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">{member.bio}</p>}</div><div className="flex items-start gap-4 text-sm lg:justify-end">{member.github&&<a className="text-link min-h-11" href={member.github} target="_blank" rel="noreferrer">GitHub</a>}{member.linkedin&&<a className="text-link min-h-11" href={member.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}{member.portfolio&&<a className="text-link min-h-11" href={member.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}</div></li>)}</ul>}
  </>;
}
