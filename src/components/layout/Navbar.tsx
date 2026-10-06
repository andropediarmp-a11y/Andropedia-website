"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Terminal, X } from "lucide-react";
import { getPortalDestinationForUser, useAuth } from "@/lib/auth-context";

// Navigation bar from the Figma design: a 60px blurred bar, logo and pill links on the left,
// "Log in" and a glass button on the right.
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // ends the server session, then clears local state
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Domains", href: "/#domains" },
    { name: "Events", href: "/events" },
    { name: "Projects", href: "/projects" },
    { name: "Team", href: "/team" },
  ];
  const portalHref = currentUser ? getPortalDestinationForUser(currentUser) : "/portal/login";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.12] bg-black/10 backdrop-blur-[10px]">
      <div className="mx-auto flex h-[60px] max-w-[1024px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-1.5 rounded-md p-1" data-cursor-text="Home" aria-label="Andropedia home">
            <Terminal className="h-6 w-6 text-white" aria-hidden="true" />
            <span className="text-[18px] font-bold leading-none tracking-[-0.9px] text-white">Andropedia</span>
          </Link>

          <nav className="hidden items-center gap-2.5 lg:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="pill-link">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2.5 sm:flex">
          <Link href={portalHref} className="pill-link" data-cursor-text="Portal">
            {currentUser ? "Portal" : "Member login"}
          </Link>
          {currentUser ? (
            <button type="button" onClick={handleLogout} className="btn-glass" data-cursor-text="Logout" title={`Log out ${currentUser.name}`}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          ) : (
            <Link href="/join" className="btn-glass" data-cursor-text="Join">
              Join now
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Link href="/join" className="btn-glass !px-3 !py-1">
            Join
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-white hover:bg-white/10"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Tablet: links collapse into the menu button as well */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hidden rounded-lg p-2 text-white hover:bg-white/10 sm:block lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-[1024px] flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10">
                {link.name}
              </Link>
            ))}
            <Link href={portalHref} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10">
              {currentUser ? "Portal" : "Member login"}
            </Link>
            {currentUser && (
              <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium text-white/80 hover:bg-white/10">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout ({currentUser.name})
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
