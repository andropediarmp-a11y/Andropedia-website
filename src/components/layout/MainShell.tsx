"use client";

import { usePathname } from "next/navigation";

// The navbar is hidden and floats over the page, so most pages keep a little room at the top for it.
// The home page is the exception: its hero fills the whole first screen, so nothing may sit above it.
export function MainShell({ children }: { children: React.ReactNode }) {
  const onHome = usePathname() === "/";
  return (
    <main id="top" className={`flex flex-1 flex-col ${onHome ? "" : "pt-[60px]"}`}>
      {children}
    </main>
  );
}
