import { AboutSteps } from "@/components/home/AboutSteps";
import { DomainsSection } from "@/components/home/DomainsSection";
import { Hero } from "@/components/home/Hero";
import { SprintSnapshot } from "@/components/home/SprintSnapshot";
import { Highlights } from "@/components/home/Highlights";
import { TeamHex } from "@/components/home/TeamHex";

// Home order: hero, the club description, the domains, then everything else.
// A short, scrolling overview. Deeper content lives on its own pages (/team, /projects,
// /events, /domains) and recruitment on /join.
export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <AboutSteps />
      <DomainsSection />
      <SprintSnapshot />
      <Highlights />
      <TeamHex />
    </div>
  );
}
