import Link from "next/link";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import type { LegalDoc } from "@/content/legal";

/** Full-page layout for the Terms of Service and Privacy Policy. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { title, updated, intro, sections } = doc;
  return (
    <div className="relative isolate overflow-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <GridLines variant="hero" />
      <BlurOrb variant="features" size={700} opacity={0.3} position={{ left: "50%", top: "300px" }} />
      <article className="relative mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Legal</p>
          <h1 className="text-[36px] font-medium leading-[1.05] tracking-[-1.5px] sm:text-[52px]">{title}</h1>
          <p className="text-xs text-white/50">Last updated {updated}</p>
          <p className="text-base leading-7 text-white/75">{intro}</p>
        </header>

        {sections.map((s, i) => (
          <section key={s.heading} className="space-y-3" aria-labelledby={`s${i}`}>
            <h2 id={`s${i}`} className="text-xl font-semibold text-white">
              {i + 1}. {s.heading}
            </h2>
            {s.body.map((b, j) =>
              typeof b === "string" ? (
                <p key={j} className="text-[15px] leading-7 text-white/70">{b}</p>
              ) : (
                <ul key={j} className="list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-white/70 marker:text-white/30">
                  {b.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )
            )}
          </section>
        ))}

        <nav aria-label="Legal pages" className="flex flex-wrap gap-4 border-t border-white/10 pt-6 text-sm text-white/60">
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/" className="hover:text-white">Back to home</Link>
        </nav>
      </article>
    </div>
  );
}
