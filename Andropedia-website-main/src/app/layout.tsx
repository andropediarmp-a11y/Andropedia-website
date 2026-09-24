import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andropedia | Student Technology Community",
  description: "Andropedia is a student technology community connecting Technical, Web, R&D, Design, Media, and PR through shared learning and practical work.",
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
    title: "Andropedia | Student Technology Community",
    description: "Learn in public, build together, and explore Andropedia's six disciplines.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-text-inverse">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
