import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        "paper-strong": "var(--color-paper-strong)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        "brand-blue": "var(--color-brand-blue)",
        "brand-blue-hover": "var(--color-brand-blue-hover)",
        "brand-blue-light": "var(--color-brand-blue-light)",
        "brand-blue-pale": "var(--color-brand-blue-pale)",
        focus: "var(--color-focus)",
        "status-upcoming": "var(--color-status-upcoming)",
        "status-development": "var(--color-status-development)",
        "status-complete": "var(--color-status-complete)",
        "status-warning": "var(--color-status-warning)",
        "status-error": "var(--color-status-error)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
