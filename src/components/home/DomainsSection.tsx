import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BlurOrb, TitleLines } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { HOME_DOMAINS } from "@/content/home";
import { DomainCard } from "./DomainCard";
import { DomainsWheel } from "./DomainsWheel";

// "Features" frame from the design: a small line, a big fading title, then the six domains.
// Large screens get a pinned wheel (DomainsWheel) that swings through the five domains as you scroll; phones and visitors who
// prefer reduced motion get the plain grid of cards. Both are in the page, CSS shows the right one, so the
// layout never jumps when the page hydrates.
export function DomainsSection() {
  return (
    <section id="domains" className="relative isolate overflow-x-clip bg-black px-5 py-24 sm:px-10">
      <BlurOrb variant="features" size={800} opacity={0.5} position={{ left: "50%", top: "42%" }} />

      <div className="relative mx-auto max-w-[1100px] space-y-14">
        <div className="relative mx-auto max-w-[800px] space-y-3 pt-6 text-center">
          <TitleLines className="-top-2 hidden sm:block" />
          <Reveal>
            <p className="text-fade text-[20px] leading-7 tracking-[-0.96px] sm:text-[24px]">Five specialised domains</p>
          </Reveal>
          <RevealLines className="text-[34px] font-medium leading-[1.1] tracking-[-2px] sm:text-[50px]">
            <span className="text-fade">Find the track that fits</span>
            <span className="text-aurora">how you build</span>
          </RevealLines>
        </div>

        <DomainsWheel className="hidden lg:motion-safe:block" />

        <Stagger as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 lg:motion-safe:hidden" stagger={0.09}>
          {HOME_DOMAINS.map((d, i) => (
            <StaggerItem as="li" key={d.id} className={`h-full lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""}`}>
              <DomainCard d={d} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="flex flex-col items-center gap-3 pt-2 text-center">
          <Link href="/join#how-selection-works" className="btn-glow" data-cursor-text="Join">
            Join now <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-[13px] leading-5 text-white/50">Recruitment 2026 is open. Pick your domain and apply.</p>
        </Reveal>
      </div>
    </section>
  );
}
