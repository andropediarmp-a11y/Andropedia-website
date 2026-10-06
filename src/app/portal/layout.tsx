import type { Metadata } from "next";

// The member portal is private: keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
