import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeadsPage() {
  return (
    <div className="surface-paper min-h-[70svh]">
      <header className="section-space-compact border-b border-[var(--color-line-light)]">
        <div className="site-container">
          <p className="type-label text-brand-blue">Leadership</p>
          <h1 className="type-kinetic mt-5 text-[clamp(3.5rem,10vw,9rem)] leading-[0.88]">Heads.</h1>
        </div>
      </header>
      <main className="site-container section-space-compact">
        <div className="editorial-grid gap-y-8">
          <h2 className="type-h2 col-span-4 md:col-span-6 lg:col-span-7">Leadership profiles are awaiting club approval.</h2>
          <div className="col-span-4 md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9">
            <p className="type-body-lg text-text-muted">Names, hierarchy, portraits, biographies, and professional links will be published here only after verification.</p>
            <Link href="/members" className="text-link mt-8 min-h-11">Meet the wider community <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
