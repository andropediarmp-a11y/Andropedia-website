import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { siteUrl } from "@/lib/site";

// Typeface from the Figma design (Inter, weights 400/500/600/700).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${inter.variable} h-full antialiased dark`}
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
