"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { PublicEvent } from "@/lib/public-content";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00`));

function EventRow({ event }: { event: PublicEvent }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "end 24%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 105, damping: 29, mass: 0.2 });
  const dateX = useTransform(progress, [0, 0.32], [-42, 0]);
  const copyX = useTransform(progress, [0.08, 0.42], [72, 0]);
  const copyOpacity = useTransform(progress, [0.08, 0.34], [0.1, 1]);
  const imageScale = useTransform(progress, [0.04, 0.52], [0.82, 1]);
  const lineScale = useTransform(progress, [0, 0.56], [0, 1]);

  return (
    <article ref={ref} className="relative grid gap-7 py-12 md:grid-cols-[11rem_1fr_auto] md:py-16">
      <motion.div style={reduced ? undefined : { scaleX: lineScale }} className="absolute bottom-0 left-0 h-px w-full origin-left bg-brand-blue" />
      <motion.p style={reduced ? undefined : { x: dateX }} className="type-label text-text-muted"><time dateTime={event.startDate}>{formatDate(event.startDate)}</time>{event.endDate && <><span aria-hidden="true"> — </span><time dateTime={event.endDate}>{formatDate(event.endDate)}</time></>}</motion.p>
      <motion.div style={reduced ? undefined : { x: copyX, opacity: copyOpacity }}>
        {event.image && <motion.div style={reduced ? undefined : { scale: imageScale }} className="group relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-media)]" data-cursor-text="EXPLORE"><Image fill sizes="(max-width: 768px) 100vw, 60vw" src={event.image.src} alt={event.image.alt} className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" /></motion.div>}
        <p className="type-label text-brand-blue">{event.type} · {event.status.replaceAll("-", " ")}</p>
        <h3 className="type-h3 mt-3">{event.title}</h3>
        <p className="type-body mt-4 text-text-muted">{event.summary}</p>
        {event.location && <p className="mt-3 text-sm text-text-muted">{event.location}</p>}
      </motion.div>
      {event.registrationUrl && <motion.a style={reduced ? undefined : { x: copyX, opacity: copyOpacity }} href={event.registrationUrl} target="_blank" rel="noreferrer" className="text-link min-h-11" data-cursor-text="OPEN">Register <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></motion.a>}
    </article>
  );
}

export function EventTimeline({ events }: { events: readonly PublicEvent[] }) {
  const upcoming = [...events].filter((event) => event.status !== "completed").sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = [...events].filter((event) => event.status === "completed").sort((a, b) => b.startDate.localeCompare(a.startDate));
  const groups = [{ label: "Upcoming", events: upcoming }, { label: "Past events", events: past }].filter((group) => group.events.length > 0);
  if (groups.length === 0) return <div className="relative overflow-hidden border-y border-[var(--color-line-light)] py-20 sm:py-28"><motion.div className="absolute left-0 top-0 h-px w-full origin-left bg-brand-blue" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }} /><div className="editorial-grid gap-y-8"><h2 className="type-h2 col-span-4 md:col-span-6">Next event to be announced.</h2><p className="type-body-lg col-span-4 text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9">Dates, location, and registration will appear here after confirmation.</p></div></div>;
  return <>{groups.map((group) => <section key={group.label} className="mb-20"><h2 className="type-label border-b border-[var(--color-line-light)] pb-4 text-text-muted">{group.label}</h2>{group.events.map((event) => <EventRow key={event.id} event={event} />)}</section>)}</>;
}
