import type { Metadata } from "next";
import { Figtree, Anton } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { siteUrl } from "@/lib/site";

// Figtree stands in for Graphik (a paid font) - weights 400/500/600/700.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Heavy condensed display face for the oversized headlines on /about.
const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "Andropedia | Official Student Technology Club", template: "%s | Andropedia" },
  description: "Official platform of Andropedia: student technology club driving innovation in Web, Technical, R&D, Design, Media, and PR. Explore our domains, member evaluations, and live leaderboards.",
  keywords: [
    "Andropedia",
    "Student Tech Club",
    "Technology Club",
    "Web Development",
    "Competitive Programming",
    "R&D",
    "AI/ML",
    "UI/UX Design",
    "Leaderboard",
    "Weekly Task Evaluation"
  ],
  authors: [{ name: "Andropedia Tech Council" }],
  openGraph: {
    title: "Andropedia | Official Student Technology Club",
    description: "Pioneering technology, building creators. Explore domains, projects, hackathons, and live member leaderboards.",
    type: "website",
    siteName: "Andropedia",
  },
  twitter: { card: "summary_large_image", title: "Andropedia | Official Student Technology Club" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${anton.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans selection:bg-emerald-400/30">
        <MotionProvider>
          <AuthProvider>
            <CustomCursor />
            <Navbar />
            <main id="top" className="flex-1 pt-[60px] flex flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
