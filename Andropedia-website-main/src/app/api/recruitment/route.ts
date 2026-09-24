import { NextRequest, NextResponse } from "next/server";
import { publicDomains } from "@/content/domains";

interface RecruitmentApplication {
  id: string;
  name: string;
  email: string;
  year: string;
  domain: string;
  skills: string;
  motivation: string;
  portfolioUrl?: string;
  submittedAt: string;
}

declare global {
  var __andropedia_recruitmentApplications: RecruitmentApplication[] | undefined;
}

const validYears = new Set(["first", "second", "third", "fourth", "other"]);
const validDomains = new Set<string>(publicDomains.map((domain) => domain.id));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const year = clean(body.year);
    const domain = clean(body.domain);
    const skills = clean(body.skills);
    const motivation = clean(body.motivation);
    const portfolioUrl = clean(body.portfolioUrl);

    if (name.length < 2 || name.length > 80) return NextResponse.json({ success: false, error: "Enter a valid full name." }, { status: 400 });
    if (!emailPattern.test(email) || email.length > 160) return NextResponse.json({ success: false, error: "Enter a valid college email." }, { status: 400 });
    if (!validYears.has(year)) return NextResponse.json({ success: false, error: "Select your year of study." }, { status: 400 });
    if (!validDomains.has(domain)) return NextResponse.json({ success: false, error: "Select an Andropedia domain." }, { status: 400 });
    if (skills.length < 20 || skills.length > 800) return NextResponse.json({ success: false, error: "Describe your skills and interests in a little more detail." }, { status: 400 });
    if (motivation.length < 40 || motivation.length > 1200) return NextResponse.json({ success: false, error: "Tell us a little more about why you want to join." }, { status: 400 });
    if (body.consent !== true) return NextResponse.json({ success: false, error: "Consent is required before submission." }, { status: 400 });

    if (portfolioUrl) {
      try {
        const url = new URL(portfolioUrl);
        if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error("Unsupported URL protocol");
      } catch {
        return NextResponse.json({ success: false, error: "Enter a valid portfolio URL." }, { status: 400 });
      }
    }

    const id = `REC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const application: RecruitmentApplication = { id, name, email, year, domain, skills, motivation, portfolioUrl: portfolioUrl || undefined, submittedAt: new Date().toISOString() };
    global.__andropedia_recruitmentApplications ??= [];
    global.__andropedia_recruitmentApplications.unshift(application);
    return NextResponse.json({ success: true, reference: id }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "The recruitment form could not be processed." }, { status: 400 });
  }
}
