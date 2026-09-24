"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { primaryNavigation } from "@/content/navigation";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isActiveRoute(pathname: string, href: string) {
  if (href === "/#about") return pathname === "/";
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function Navbar() {
  const pathname = usePathname();
  const menuId = useId();
  const menuTitleId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { currentUser } = useAuth();

  const portalHref = currentUser ? getPortalDestinationForUser(currentUser) : "/portal/login";
  const portalLabel = currentUser ? "Open portal" : "Member portal";

  useEffect(() => {
    const updateScrolledState = () => setHasScrolled(window.scrollY > 12);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menu = menuRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableItems = () =>
      menu ? Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector)) : [];

    focusableItems()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusableItems();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktopQuery = window.matchMedia("(min-width: 80rem)");
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
      trigger?.focus();
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-24 rounded-[var(--radius-control)] bg-ink px-4 py-3 text-sm font-semibold text-text-inverse transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b text-text transition-[background-color,border-color] duration-[var(--duration-standard)] ${
          hasScrolled || mobileMenuOpen
            ? "border-[var(--color-line-light)] bg-[rgba(255,255,255,0.95)] backdrop-blur-xl"
            : "border-transparent bg-[rgba(245,246,248,0.9)] backdrop-blur-md"
        }`}
      >
        <div className="site-container flex h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center"
            aria-label="Andropedia home"
            data-cursor-text="Home"
          >
            <AndropediaLogo
              className="w-[5.5rem]"
              priority
              sizes="88px"
            />
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {primaryNavigation.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-cursor-text="OPEN"
                  className={`nav-link relative flex min-h-11 items-center px-2.5 text-[13px] font-medium transition-colors duration-[var(--duration-micro)] 2xl:px-3 ${
                    active ? "text-brand-blue" : "text-text hover:text-brand-blue-hover"
                  }`}
                >
                  {item.label}
                  {active && <motion.span layoutId="active-nav-signal" className="absolute inset-x-2.5 bottom-1 h-px bg-brand-blue" transition={{ type: "spring", stiffness: 430, damping: 38 }} aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={portalHref}
              className="hidden min-h-11 items-center text-sm font-medium text-text-muted transition-colors hover:text-text lg:inline-flex"
              data-cursor-text="OPEN"
            >
              {portalLabel}
            </Link>
            <Link href="/join" className="button-primary min-w-16 px-3 sm:min-w-20 sm:px-[1.125rem]" data-cursor-text="JOIN">
              Join
            </Link>
            <button
              ref={triggerRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-light)] text-text transition-colors hover:border-brand-blue hover:text-brand-blue xl:hidden"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls={menuId}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={menuTitleId}
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-paper text-text xl:hidden"
        >
          <div className="site-container flex min-h-full flex-col py-8 sm:py-12">
            <p id={menuTitleId} className="type-label text-text-muted">
              Navigate Andropedia
            </p>
            <nav className="mt-6 border-t border-[var(--color-line-light)]" aria-label="Mobile navigation">
              {primaryNavigation.map((item, index) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-16 items-center justify-between border-b border-[var(--color-line-light)] py-3 text-2xl font-semibold tracking-[-0.03em] sm:min-h-20 sm:text-4xl ${
                      active ? "text-brand-blue" : "text-text hover:text-brand-blue-hover"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs font-normal tracking-normal text-text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <Link href={portalHref} onClick={closeMenu} className="text-link min-h-11 text-sm">
                {portalLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/join" onClick={closeMenu} className="button-primary w-full sm:w-auto">
                Join Andropedia
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
