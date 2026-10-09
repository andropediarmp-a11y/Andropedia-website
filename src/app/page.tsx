import { AboutSteps } from "@/components/home/AboutSteps";
import { DomainsSection } from "@/components/home/DomainsSection";
import { HandRobotHero } from "@/components/home/HandRobotHero";
import { SprintSnapshot } from "@/components/home/SprintSnapshot";
import { Highlights } from "@/components/home/Highlights";
import { TeamHex } from "@/components/home/TeamHex";

// Rebuilt at most once a minute so the leaderboard card stays fresh without a database hit per visitor.
export const revalidate = 60;

// Home order: the hand + robot hero (reveals the club introduction on scroll), the club description, the domains, then everything else.
// A short, scrolling overview. Deeper content lives on its own pages (/team, /projects,
// /events, /domains) and recruitment on /join.
export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <HandRobotHero />
      <AboutSteps />
      <DomainsSection />
      <SprintSnapshot />
      <Highlights />
      <TeamHex />
    </div>
  );
}
