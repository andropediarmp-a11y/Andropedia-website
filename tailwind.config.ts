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
        sans: ["var(--font-figtree)", "Figtree", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        // The Figma design has no monospace face; small caps labels use Figtree.
        mono: ["var(--font-figtree)", "Figtree", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        // The previous green accent now maps onto the Figma blue (Foundation/Blue #3395FF) so every
        // existing `emerald-*` class picks up the new palette.
        emerald: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b9d8ff",
          300: "#8cbfff",
          400: "#3395ff",
          500: "#1f7fe8",
          600: "#1a66c0",
          700: "#174f94",
          800: "#143a6b",
          900: "#0f2a4d",
          950: "#0a1a30",
        },
        // Teal/cyan -> Figma Foundation/Teal and Indigo
        cyan: {
          300: "#9adbe7",
          400: "#59c0d2",
          500: "#3aa6ba",
          600: "#2d8798",
        },
        violet: {
          300: "#a6a5ec",
          400: "#7978de",
          500: "#6362c8",
          600: "#5150a8",
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
