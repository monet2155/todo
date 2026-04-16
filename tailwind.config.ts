import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        heuk:         "#0F0E0C",
        paulownia:    "#1C1A18",
        ebony:        "#252220",
        "ebony-plus": "#2C2927",
        patina:       "#2A4A3E",
        hwang:        "#D4A017",
        gilded:       "#F5C518",
        jeok:         "#C0392B",
        cheong:       "#1A5F7A",
        baek:         "#F0EAD6",
        violet:       "#6B3FA0",
        ember:        "#E07B39",
      },
      fontFamily: {
        cinzel:        ["var(--font-cinzel)", "Georgia", "serif"],
        "cinzel-deco": ["var(--font-cinzel-deco)", "Georgia", "serif"],
        inter:         ["var(--font-inter)", "sans-serif"],
        hahmlet:       ["var(--font-hahmlet)", "var(--font-cinzel)", "Georgia", "serif"],
        noto:          ["var(--font-noto)", "var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        "xp-popup": {
          "0%":   { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "20%":  { opacity: "1", transform: "translateY(0) scale(1.1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1)" },
        },
        "tip-pulse": {
          "0%, 100%": { opacity: "0.9" },
          "50%":      { opacity: "1", filter: "brightness(1.4)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "modal-enter": {
          from: { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "seal-stamp": {
          "0%":   { opacity: "0", transform: "scale(1.6)" },
          "30%":  { opacity: "1", transform: "scale(0.95)" },
          "70%":  { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1)" },
        },
      },
      animation: {
        "xp-popup":    "xp-popup 1.8s ease-out forwards",
        "tip-pulse":   "tip-pulse 2s ease-in-out infinite",
        "fade-up":     "fade-up 0.4s ease-out forwards",
        "modal-enter": "modal-enter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "seal-stamp":  "seal-stamp 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
