import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Andropedia",
  description: "What personal information Andropedia collects, why, who can see it, and how to ask for it to be removed.",
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
