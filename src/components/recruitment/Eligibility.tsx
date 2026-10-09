import { Check } from "lucide-react";
import { ELIGIBILITY } from "@/content/recruitment";

export function Eligibility() {
  return (
    <section className="glass-card mx-auto max-w-3xl space-y-4 p-6 sm:p-8" aria-label="Who can apply">
      <h2 className="text-fade-strong text-xl font-semibold">Who can apply</h2>
      <ul className="space-y-3">
        {ELIGIBILITY.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
