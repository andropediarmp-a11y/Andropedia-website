import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { RecruitmentForm } from "@/components/recruitment/RecruitmentForm";
import { HackerText } from "@/components/motion/HackerText";
import { SignalDivider } from "@/components/motion/SignalDivider";

const recruitmentSteps = [
  { number: "01", title: "Choose your direction", body: "Select the discipline that best matches the work you want to learn and contribute." },
  { number: "02", title: "Show how you think", body: "Tell us about your interests, current skills, and the kind of problems you want to explore." },
  { number: "03", title: "Start the conversation", body: "Submit your introduction so the recruitment team can review it and follow up." },
];

export default function JoinPage() {
  return (
    <div className="surface-paper overflow-hidden">
      <header className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-16 top-[18%] h-40 w-40 rounded-full border-2 border-brand-blue sm:h-64 sm:w-64" />
          <div className="absolute right-[7%] top-[12%] h-24 w-24 rotate-6 bg-brand-blue sm:h-40 sm:w-40" />
          <div className="absolute bottom-[8%] right-[18%] h-32 w-20 -rotate-6 bg-brand-blue-pale sm:h-52 sm:w-36" />
          <div className="absolute bottom-[14%] left-[9%] h-px w-[36%] bg-brand-blue" />
        </div>
        <div className="site-container relative z-10 text-center">
          <AndropediaLogo className="mx-auto w-36 sm:w-44" priority sizes="(max-width: 640px) 144px, 176px" />
          <p className="type-label mt-8 text-brand-blue"><HackerText text="Recruitment / Signal 007" /></p>
          <h1 className="type-kinetic mx-auto mt-6 max-w-[11ch] text-[clamp(3.2rem,9vw,9rem)] leading-[0.88]">Find your place at Andropedia.</h1>
          <p className="type-body-lg mx-auto mt-8 max-w-[52ch] text-text-muted">Choose a discipline, introduce your work and interests, and begin your application to the Andropedia community.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
            <Link href="#application" className="button-primary">Start your application <ArrowDown className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/domains" className="text-link min-h-11">Explore the domains <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <SignalDivider />

      <section className="surface-paper-strong section-space" aria-labelledby="process-heading">
        <div className="site-container editorial-grid gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <p className="type-label text-brand-blue">The recruitment path</p>
            <h2 id="process-heading" className="type-kinetic mt-5 max-w-[10ch] text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.94]">A clear place to begin.</h2>
          </div>
          <ol className="col-span-4 border-t border-[var(--color-line-light)] md:col-span-8 lg:col-span-6 lg:col-start-7">
            {recruitmentSteps.map((step) => (
              <li key={step.number} className="grid gap-3 border-b border-[var(--color-line-light)] py-8 sm:grid-cols-[4rem_1fr]">
                <span className="type-label pt-1 text-brand-blue">{step.number}</span>
                <span><span className="block text-2xl font-semibold tracking-[-0.03em]">{step.title}</span><span className="type-body mt-3 block text-text-muted">{step.body}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="application" className="surface-paper scroll-mt-20 section-space" aria-labelledby="application-heading">
        <div className="site-container editorial-grid gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="type-label text-brand-blue"><HackerText text="Recruitment form / 008" /></p>
              <h2 id="application-heading" className="type-kinetic mt-5 max-w-[9ch] text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.94]">Introduce yourself.</h2>
              <p className="type-body-lg mt-6 text-text-muted">No polished résumé is required. Be specific about what you are learning, what you have tried, and where you want to grow.</p>
            </div>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <RecruitmentForm />
          </div>
        </div>
      </section>

      <section className="surface-ink section-space-compact text-text-inverse">
        <div className="site-container editorial-grid gap-y-8">
          <p className="type-label col-span-4 text-brand-blue-light md:col-span-2">Already a member?</p>
          <h2 className="type-kinetic col-span-4 max-w-[13ch] text-[clamp(2.8rem,6vw,6rem)] leading-[0.9] text-white md:col-span-6 lg:col-span-7">Continue your work in the member portal.</h2>
          <div className="col-span-4 md:col-span-4 md:col-start-5 lg:col-span-3 lg:col-start-10 lg:self-end"><Link href="/portal/login" className="button-primary w-full sm:w-auto">Member login <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>
      </section>
    </div>
  );
}
