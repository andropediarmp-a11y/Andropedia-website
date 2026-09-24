import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicEvents } from "@/content/events";
import { publicProjects } from "@/content/projects";
import { HeroExperience } from "./HeroExperience";
import { OpeningSequence } from "./OpeningSequence";
import { AboutStory } from "./AboutStory";
import { DomainStory } from "./DomainStory";
import { ScrollStatement } from "./ScrollStatement";
import { JoinStage } from "./JoinStage";
import { HomePreviewChapter } from "./HomePreviewChapter";
import { SignalDivider } from "@/components/motion/SignalDivider";
import { OrbTransition } from "@/components/motion/OrbTransition";

export function HomeExperience() {
  const projectItems = publicProjects.map((project) => ({ id: project.id, kicker: project.status.replaceAll("-", " "), title: project.title, summary: project.summary }));
  const eventItems = [...publicEvents].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((event) => ({ id: event.id, kicker: new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${event.startDate}T00:00:00`)), title: event.title, summary: event.summary }));

  return (
    <div className="overflow-hidden bg-paper text-text">
      <OpeningSequence />
      <HeroExperience />
      <AboutStory />
      <SignalDivider />
      <DomainStory />
      <OrbTransition label="Domains / Projects" />
      <ScrollStatement />
      <HomePreviewChapter eyebrow="Club projects" title="Currently building." href="/projects" linkLabel="View projects" items={projectItems} emptyTitle="The release ledger is being prepared." emptyBody="Verified club projects will appear here with their real development status." />
      <OrbTransition label="Projects / Events" />
      <HomePreviewChapter eyebrow="Events & hackathons" title="What happens next." href="/events" linkLabel="View events" items={eventItems} emptyTitle="Next event to be announced." emptyBody="Confirmed dates and registration details will be published here." strong />
      <section className="surface-paper section-space-compact border-y border-[var(--color-line-light)]" aria-labelledby="people-heading">
        <div className="site-container">
          <p id="people-heading" className="type-label text-text-muted">People</p>
          <div className="mt-6 divide-y divide-[var(--color-line-light)] border-y border-[var(--color-line-light)]">
            <Link href="/heads" className="group magnetic-target flex min-h-28 items-center justify-between py-6" data-cursor-text="OPEN"><span className="type-kinetic text-4xl sm:text-6xl">Heads</span><ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" /></Link>
            <Link href="/members" className="group magnetic-target flex min-h-28 items-center justify-between py-6" data-cursor-text="OPEN"><span className="type-kinetic text-4xl sm:text-6xl">Members</span><ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" /></Link>
          </div>
        </div>
      </section>
      <JoinStage />
    </div>
  );
}
