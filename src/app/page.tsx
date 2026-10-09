import { AboutSteps } from "@/components/home/AboutSteps";
import { DomainsSection } from "@/components/home/DomainsSection";
import { HandRobotHero } from "@/components/home/HandRobotHero";
import { Highlights } from "@/components/home/Highlights";
import { TeamHex } from "@/components/home/TeamHex";
import { SprintSnapshot } from "@/components/home/SprintSnapshot";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <HandRobotHero />
      <AboutSteps />
      <DomainsSection />
      <Highlights />
      <TeamHex />
      <SprintSnapshot />
    </div>
  );
}
