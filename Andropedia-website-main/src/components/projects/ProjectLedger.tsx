"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { PublicProject, PublicProjectStatus } from "@/lib/public-content";

const groups: Array<{ status: PublicProjectStatus; label: string }> = [
  { status: "in-development", label: "In development" },
  { status: "upcoming", label: "Upcoming" },
  { status: "completed", label: "Completed" },
];

function ProjectRow({ project, label, index }: { project: PublicProject; label: string; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.22 });
  const mediaScale = useTransform(progress, [0.04, 0.44, 0.92], [0.8, 1, 1.08]);
  const mediaY = useTransform(progress, [0, 1], [90, -48]);
  const titleX = useTransform(progress, [0.1, 0.48], [64, 0]);
  const titleOpacity = useTransform(progress, [0.08, 0.34], [0.18, 1]);
  const clipPath = useTransform(progress, [0.06, 0.42], ["inset(14% 18% 14% 18% round 1.5rem)", "inset(0% 0% 0% 0% round 1.5rem)"]);
  const lineScale = useTransform(progress, [0.12, 0.58], [0, 1]);

  return (
    <article ref={ref} className="relative min-h-[78svh] border-b border-[var(--color-line-light)] py-14 lg:min-h-[105svh] lg:py-24">
      <motion.div style={reduced ? undefined : { scaleX: lineScale }} className="absolute left-0 top-0 h-px w-full origin-left bg-brand-blue" />
      <div className="grid gap-10 lg:grid-cols-[8rem_minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-center">
        <div className="type-label text-brand-blue"><span className="block text-text-muted">{String(index + 1).padStart(2, "0")}</span><span className="mt-3 block">{label}</span></div>
        <motion.div style={reduced ? undefined : { scale: mediaScale, y: mediaY, clipPath }} className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-media)] bg-brand-blue-pale" data-cursor-text="VIEW">
          {project.image ? <Image fill sizes="(max-width: 1024px) 100vw, 55vw" src={project.image.src} alt={project.image.alt} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-brand-blue-pale),rgba(66,115,228,0.22))]"><span className="absolute inset-x-[12%] top-1/2 h-px bg-brand-blue" /><span className="absolute left-[28%] top-[24%] h-3 w-3 rounded-full bg-brand-blue" /><span className="absolute bottom-[22%] right-[24%] h-2 w-2 rounded-full bg-brand-blue" /></div>}
        </motion.div>
        <motion.div style={reduced ? undefined : { x: titleX, opacity: titleOpacity }}>
          <h3 className="type-h3">{project.title}</h3>
          <p className="type-body mt-5 text-text-muted">{project.summary}</p>
          {project.domain && <p className="type-label mt-5 text-text-muted">{project.domain}</p>}
          <div className="mt-7 flex flex-col items-start gap-2">
            {project.projectUrl && <a href={project.projectUrl} className="text-link min-h-11" target="_blank" rel="noreferrer" data-cursor-text="OPEN">View project <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
            {project.repositoryUrl && <a href={project.repositoryUrl} className="text-link min-h-11" target="_blank" rel="noreferrer" data-cursor-text="CODE">Repository <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
          </div>
        </motion.div>
      </div>
    </article>
  );
}

export function ProjectLedger({ projects }: { projects: readonly PublicProject[] }) {
  const visibleGroups = groups.map((group) => ({ ...group, items: projects.filter((project) => project.status === group.status) })).filter((group) => group.items.length > 0);
  if (visibleGroups.length === 0) return <div className="relative overflow-hidden border-y border-[var(--color-line-light)] py-20 sm:py-28"><motion.div className="absolute left-0 top-0 h-px w-full origin-left bg-brand-blue" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }} /><div className="editorial-grid gap-y-8"><h2 className="type-h2 col-span-4 md:col-span-6 lg:col-span-6">The first verified release is still in progress.</h2><p className="type-body-lg col-span-4 text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9">Projects will appear here when their scope, status, and links are ready to publish.</p></div></div>;
  let itemIndex = 0;
  return <>{visibleGroups.map((group) => <section key={group.status} aria-label={group.label}>{group.items.map((project) => <ProjectRow key={project.id} project={project} label={group.label} index={itemIndex++} />)}</section>)}</>;
}
