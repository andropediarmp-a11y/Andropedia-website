import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { primaryNavigation } from "@/content/navigation";
import { publicDomains } from "@/content/domains";

const footerNavigation = primaryNavigation.filter((item) => item.href !== "/#about");

export function Footer() {
  return (
    <footer className="surface-paper-strong border-t border-[var(--color-line-light)]">
      <div className="site-container py-16 sm:py-20 lg:py-24">
        <div className="editorial-grid gap-y-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Link href="/" className="inline-flex" aria-label="Andropedia home">
              <AndropediaLogo className="w-40 sm:w-48" sizes="(max-width: 640px) 160px, 192px" />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-text-muted sm:text-base">
              A student technology community for people who learn, build, and share their work together.
            </p>
            <Link href="/join" className="button-primary mt-8">
              Join Andropedia
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <nav className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-8" aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="type-label text-text-muted">
              Explore
            </h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link href="/#about" className="flex min-h-11 items-center text-sm font-medium hover:text-brand-blue-hover">
                  About
                </Link>
              </li>
              {footerNavigation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex min-h-11 items-center text-sm font-medium hover:text-brand-blue-hover">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="col-span-2 md:col-span-3 lg:col-span-3" aria-labelledby="footer-domains">
            <h2 id="footer-domains" className="type-label text-text-muted">
              Domains
            </h2>
            <ul className="mt-5 space-y-1">
              {publicDomains.map((domain) => (
                <li key={domain.id}>
                  <Link
                    href={`/domains#${domain.slug}`}
                    className="flex min-h-11 items-center text-sm font-medium hover:text-brand-blue-hover"
                  >
                    {domain.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-[var(--color-line-light)] pt-6 text-xs text-text-muted sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Andropedia. All rights reserved.</p>
          <Link href="/portal/login" className="text-link min-h-11">
            Member portal
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
