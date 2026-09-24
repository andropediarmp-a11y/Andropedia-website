import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { publicDomains } from "@/content/domains";
import { Reveal } from "@/components/motion/Reveal";
import { KineticPageHeader } from "@/components/motion/KineticPageHeader";

export default function DomainsPage() {
  return (
    <div className="surface-paper">
      <KineticPageHeader label="Six pillars" title="Six disciplines. One working system." description="Each domain contributes a different way of thinking, making, and communicating. Together, they shape the club’s work." />

      <nav className="site-container py-8" aria-label="Domain chapters">
        <ol className="grid gap-px border border-[var(--color-line-light)] bg-[var(--color-line-light)] sm:grid-cols-2 lg:grid-cols-3">
          {publicDomains.map((domain, index) => (
            <li key={domain.id} className="bg-paper-strong">
              <Link href={`#${domain.slug}`} className="magnetic-target flex min-h-20 items-center justify-between gap-3 p-5 text-sm font-semibold hover:text-brand-blue" data-cursor-text="EXPLORE">
                <span><span className="type-label mr-3 text-text-muted">{String(index + 1).padStart(2, "0")}</span>{domain.name}</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="site-container pb-[var(--section-space)]">
        {publicDomains.map((domain, index) => (
          <article key={domain.id} id={domain.slug} className="scroll-mt-28 border-t border-[var(--color-line-light)] py-16 sm:py-24">
            <Reveal className="editorial-grid gap-y-8">
              <div className="col-span-4 md:col-span-2 lg:col-span-2"><p className="type-label text-brand-blue">Domain {String(index + 1).padStart(2, "0")}</p></div>
              <div className="col-span-4 md:col-span-6 lg:col-span-6"><h2 className="type-h2">{domain.name}</h2><p className="type-body-lg mt-6 text-text-muted">{domain.summary}</p></div>
              <div className="col-span-4 md:col-span-5 md:col-start-4 lg:col-span-3 lg:col-start-10 lg:self-end"><Link href="/heads" className="text-link min-h-11" data-cursor-text="OPEN">Meet domain heads <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  );
}
