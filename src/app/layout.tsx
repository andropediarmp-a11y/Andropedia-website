import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andropedia | Official Student Technology Club",
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080b11] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        <AuthProvider>
          <CustomCursor />
          <Navbar />
          <main className="flex-1 pt-20 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
