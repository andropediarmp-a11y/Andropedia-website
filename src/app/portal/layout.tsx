import type { Metadata } from "next";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";

// The member portal is private: keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Shared backdrop for every portal page: black canvas, faint grid lines and a soft glowing orb.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex-1 overflow-hidden bg-black">
      <GridLines variant="hero" />
      <BlurOrb variant="features" size={800} opacity={0.3} position={{ left: "50%", top: "320px" }} />
      <div className="relative">{children}</div>
    </div>
  );
}
