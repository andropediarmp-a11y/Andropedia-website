import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { RevealLines, Stagger, StaggerItem } from "@/components/design/scroll";
import { ABOUT_POINTS } from "@/content/home";
import { ACCENTS, accentVars } from "@/content/accents";
import { MascotInteractive } from "./MascotInteractive";

const POINT_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.pink];

export function AboutSteps() {
  return (
    <section id="about" className="relative isolate overflow-x-clip bg-black px-5 py-20 sm:px-10 lg:px-[70px] lg:py-24">
      <BlurOrb variant="features" size={800} opacity={0.35} position={{ left: "30%", top: "50%" }} />

      <div className="mx-auto max-w-[1360px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.25fr_auto] lg:gap-14">
          {/* Left Column: Expanded Text Filling Space */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Reveal margin="0px">
                <p className="chip">About Andropedia</p>
              </Reveal>
              <RevealLines margin="0px" className="text-[36px] font-medium leading-[1.1] tracking-[-2px] sm:text-[50px] lg:text-[54px]">
                <span className="text-fade">Not just a club.</span>
                <span className="text-aurora">An engineering forge.</span>
              </RevealLines>
              <Reveal delay={0.15} margin="0px">
                <p className="max-w-[760px] text-[15px] leading-relaxed text-white/80 sm:text-[16px] lg:text-[17px]">
                  Andropedia is more than just a technical club at SRMIST. It&apos;s a space where ideas meet people who are willing to bring them to life. From technology and development to design, media, and public relations, we bring different minds and talents together to create, collaborate, and make things happen. Together, we aim to turn ideas into action and grow as a community.
                </p>
              </Reveal>
            </div>

            <Stagger as="ul" className="space-y-5 lg:max-w-[740px]" stagger={0.14} delay={0.2} margin="0px">
              {ABOUT_POINTS.map((p, i) => (
                <StaggerItem as="li" key={p.title} from="left">
                  <div
                    className="space-y-1.5 border-l-2 pl-5 transition-colors hover:border-l-white"
                    style={{ ...accentVars(POINT_ACCENTS[i % 3]), borderColor: POINT_ACCENTS[i % 3].a1 }}
                  >
                    <h3 className="text-accent text-[19px] font-medium leading-[28px] sm:text-[20px]">{p.title}</h3>
                    <p className="text-[15px] leading-relaxed text-white/70 sm:text-[16px]">{p.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Right Column: Mascot Aligned to the Right Edge */}
          <div className="flex items-center justify-center lg:justify-end">
            <MascotInteractive />
          </div>
        </div>
      </div>
    </section>
  );
}
