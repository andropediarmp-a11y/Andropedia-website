import { publicEvents } from "@/content/events";
import { KineticPageHeader } from "@/components/motion/KineticPageHeader";
import { EventTimeline } from "@/components/events/EventTimeline";

export default function EventsPage() {
  return (
    <div className="surface-paper-strong min-h-[70svh]">
      <KineticPageHeader label="Calendar" title="Events & hackathons." description="Confirmed gatherings, workshops, and competitions—published only when the details are ready." />
      <main className="site-container section-space-compact"><EventTimeline events={publicEvents} /></main>
    </div>
  );
}
