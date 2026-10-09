import type { Config } from "tailwindcss";

// Design tokens come from the Figma file "Master No-Code Web Design with Framer" (dark theme).
// Figtree everywhere, pure black canvas, white text at 100/70/50/60 %, blue/indigo/purple accents.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "SF Pro", "Inter", "sans-serif"],
        mono: ["var(--font-space-mono)", "Space Mono", "monospace"],
        tech: ["var(--font-space-mono)", "Space Mono", "monospace"],
        display: ["var(--font-space-mono)", "Space Mono", "monospace"],
      },
      colors: {
        electric: {
          400: "#3388ff",
          500: "#0066ff",
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001a66",
          950: "#000d33",
        },
        // Mapped to electric blue theme (#0066ff)
        emerald: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b9d8ff",
          300: "#8cbfff",
          400: "#3388ff",
          500: "#0066ff",
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001a66",
          950: "#000d33",
        },
        cyan: {
          300: "#9adbe7",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
        },
        violet: {
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8",
        },
        ink: "#000000",
      },
      borderRadius: {
        card: "40px",
        "card-sm": "20px",
      },
      letterSpacing: {
        "display": "-3px",
        "heading": "-2px",
      },
    },
  },
  plugins: [],
};

export default config;
