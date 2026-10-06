import { AboutSteps } from "@/components/home/AboutSteps";
import { DomainsSection } from "@/components/home/DomainsSection";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { TeamHex } from "@/components/home/TeamHex";

// Home: a short, scrolling overview. Deeper content lives on its own pages (/team, /projects,
// /events, /domains) and recruitment on /join.
export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <AboutSteps />
      <DomainsSection />
      <Highlights />
      <TeamHex />
    </div>
  );
}
