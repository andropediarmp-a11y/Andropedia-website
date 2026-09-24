import { MembersDirectory } from "@/components/people/MembersDirectory";

export default function MembersPage() {
  return (
    <div className="surface-paper min-h-[70svh]">
      <header className="section-space-compact border-b border-[var(--color-line-light)]">
        <div className="site-container editorial-grid gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-8"><p className="type-label text-brand-blue">Community</p><h1 className="type-kinetic mt-5 text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.88]">Members.</h1></div>
          <p className="type-body-lg col-span-4 text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:self-end">Public profiles include only approved community information. Contact details and portal activity remain private.</p>
        </div>
      </header>
      <main className="site-container section-space-compact"><MembersDirectory /></main>
    </div>
  );
}

