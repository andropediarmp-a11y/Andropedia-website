import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Andropedia",
  description: "The rules for using the Andropedia website, applying to the club, registering for events and using the member portal.",
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
