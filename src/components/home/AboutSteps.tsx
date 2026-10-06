import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { ABOUT_POINTS } from "@/content/home";
import { ACCENTS, accentVars } from "@/content/accents";

const POINT_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.pink];
const DAY_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.purple, ACCENTS.pink];

// "Steps" frame from the design: heading and three feature rows on the left, glass UI card on the right.
export function AboutSteps() {
  return (
    <section id="about" className="relative isolate scroll-mt-20 overflow-hidden bg-black px-5 py-24 sm:px-10 lg:px-[70px]">
      <BlurOrb variant="features" size={800} opacity={0.35} position={{ left: "30%", top: "50%" }} />

      <div className="relative mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-[minmax(0,582px)_1fr]">
        <Reveal className="space-y-12">
          <div className="space-y-5">
            <p className="chip">About Andropedia</p>
            <h2 className="text-[36px] font-medium leading-[1.1] tracking-[-2px] sm:text-[50px]">
              <span className="text-fade">Not just a club.</span> <span className="text-aurora">An engineering forge.</span>
            </h2>
            <p className="max-w-[520px] text-[16px] leading-6 text-white/70">
              Andropedia exists to close the gap between textbook theory and real, high-performance software craftsmanship.
              Six specialised domains turn passionate students into engineers, designers, researchers and leaders.
            </p>
          </div>

          <ul className="space-y-8">
            {ABOUT_POINTS.map((p, i) => (
              <li key={p.title} className="space-y-1.5 border-l-2 pl-5" style={{ ...accentVars(POINT_ACCENTS[i % 3]), borderColor: POINT_ACCENTS[i % 3].a1 }}>
                <h3 className="text-accent text-[20px] font-medium leading-[30px]">{p.title}</h3>
                <p className="text-[16px] leading-6 text-white/70">{p.text}</p>
              </li>
            ))}
          </ul>

          <Link href="/domains" className="btn-glass">
            Explore the domains <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="glass-card p-5 sm:p-7">
            <p className="text-aurora text-[12px] font-medium uppercase tracking-[0.1em]">A week in a sprint</p>
            <ol className="mt-5 space-y-3">
              {[
                ["Mon", "Prompt released", "Domain leads publish this week's challenge."],
                ["Tue-Fri", "Build & submit", "Members ship a repo, demo or Figma file."],
                ["Weekend", "Evaluation", "Leads score on depth, innovation, completion, docs."],
                ["Sun night", "Leaderboard moves", "Points update live for the whole club."],
              ].map(([day, title, text], i) => (
                <li key={title} className="glass-inner flex items-start gap-4 p-4" style={accentVars(DAY_ACCENTS[i % 4])}>
                  <span className="chip-accent mt-0.5 w-[72px] shrink-0 justify-center !px-1 text-[11px]">{day}</span>
                  <div>
                    <p className="text-[15px] font-medium leading-5 text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-white/60">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
