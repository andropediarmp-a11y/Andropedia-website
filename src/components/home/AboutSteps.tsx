import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { ABOUT_POINTS } from "@/content/home";
import { ACCENTS, accentVars } from "@/content/accents";
import { SprintStage } from "./SprintStage";

const POINT_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.pink];

// "Steps" frame from the design: heading and three feature rows on the left, the week-in-a-sprint card on
// the right. On large screens the card's four steps light up one by one while the section is pinned
// (see SprintStage).
export function AboutSteps() {
  return (
    <section id="about" className="relative isolate overflow-x-clip bg-black px-5 py-24 sm:px-10 lg:px-[70px] lg:py-0 lg:motion-reduce:py-24">
      <BlurOrb variant="features" size={800} opacity={0.35} position={{ left: "30%", top: "50%" }} />

      <SprintStage
        intro={
          <div className="space-y-9 lg:space-y-7">
            <div className="space-y-5">
              <Reveal margin="0px">
                <p className="chip">About Andropedia</p>
              </Reveal>
              <RevealLines margin="0px" className="text-[36px] font-medium leading-[1.1] tracking-[-2px] sm:text-[50px]">
                <span className="text-fade">Not just a club.</span>
                <span className="text-aurora">An engineering forge.</span>
              </RevealLines>
              <Reveal delay={0.15} margin="0px">
                <p className="max-w-[520px] text-[16px] leading-6 text-white/70">
                  Andropedia exists to close the gap between textbook theory and real, high-performance software craftsmanship.
                  Five specialised domains turn passionate students into engineers, designers, researchers and leaders.
                </p>
              </Reveal>
            </div>

            <Stagger as="ul" className="space-y-8 lg:space-y-5" stagger={0.14} delay={0.2} margin="0px">
              {ABOUT_POINTS.map((p, i) => (
                <StaggerItem as="li" key={p.title} from="left">
                  <div className="space-y-1.5 border-l-2 pl-5" style={{ ...accentVars(POINT_ACCENTS[i % 3]), borderColor: POINT_ACCENTS[i % 3].a1 }}>
                    <h3 className="text-accent text-[20px] font-medium leading-[30px]">{p.title}</h3>
                    <p className="text-[16px] leading-6 text-white/70">{p.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1} margin="0px">
              <Link href="/domains" className="btn-glass">
                Explore the domains <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        }
      />
    </section>
  );
}
