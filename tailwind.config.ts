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
        // V2 — 옻칠 팔레트 (Lacquerware palette)
        lacquer:    "#0E0C09",   // base background
        panel:      "#171410",   // sidebar / panel bg
        card:       "#201C18",   // card background
        "card-hi":  "#281E19",   // card hover
        modal:      "#2D2621",   // modal bg
        gold:       "#B8860B",   // primary accent (antique gold)
        "gold-hi":  "#D4A827",   // highlight gold
        crimson:    "#9B2D20",   // strength / danger
        celadon:    "#2E6B5A",   // intelligence / wisdom (border)
        violet:     "#5C3580",   // charisma
        ember:      "#C0682B",   // urgency / overdue
        parchment:  "#E8DBBE",   // primary text
        ink:        "#8B7B60",   // secondary text
        "ink-dim":  "#4A4035",   // tertiary / disabled
        // V1 aliases for backward compatibility
        heuk:       "#0E0C09",
        paulownia:  "#171410",
        ebony:      "#201C18",
        "ebony-plus": "#2D2621",
        patina:     "#3A5E4E",
        hwang:      "#B8860B",
        gilded:     "#D4A827",
        jeok:       "#9B2D20",
        cheong:     "#2E6B5A",
        baek:       "#E8DBBE",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        mono:      ["var(--font-mono)", "ui-monospace", "monospace"],
        lora:      ["var(--font-lora)", "Georgia", "serif"],
        hahmlet:   ["var(--font-hahmlet)", "Georgia", "serif"],
        gowun:     ["var(--font-gowun)", "Georgia", "serif"],
        // V1 aliases
        cinzel:        ["var(--font-cormorant)", "Georgia", "serif"],
        "cinzel-deco": ["var(--font-mono)", "monospace"],
        inter:         ["var(--font-lora)", "Georgia", "serif"],
        noto:          ["var(--font-gowun)", "Georgia", "serif"],
      },
      keyframes: {
        "ink-appear": {
          from: { opacity: "0", filter: "blur(4px)" },
          to:   { opacity: "1", filter: "blur(0)" },
        },
        "ink-rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "ink-stamp": {
          "0%":   { opacity: "0", transform: "scale(1.5)" },
          "35%":  { opacity: "1", transform: "scale(0.95)" },
          "65%":  { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1)" },
        },
        "xp-float": {
          "0%":   { opacity: "0", transform: "translateY(8px) scale(0.9)" },
          "20%":  { opacity: "1", transform: "translateY(0) scale(1.05)" },
          "100%": { opacity: "0", transform: "translateY(-48px) scale(1)" },
        },
        "modal-enter": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "page-enter": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
        "tip-pulse": {
          "0%, 100%": { opacity: "0.85" },
          "50%":      { opacity: "1", filter: "brightness(1.3)" },
        },
        // V1 compat
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "seal-stamp": {
          "0%":   { opacity: "0", transform: "scale(1.6)" },
          "30%":  { opacity: "1", transform: "scale(0.95)" },
          "70%":  { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1)" },
        },
        "xp-popup": {
          "0%":   { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "20%":  { opacity: "1", transform: "translateY(0) scale(1.1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1)" },
        },
      },
      animation: {
        "ink-appear":  "ink-appear 0.35s ease-out forwards",
        "ink-rise":    "ink-rise 0.4s ease-out forwards",
        "ink-stamp":   "ink-stamp 0.8s ease-out forwards",
        "xp-float":    "xp-float 1.8s ease-out forwards",
        "modal-enter": "modal-enter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "page-enter":  "page-enter 0.5s ease-out forwards",
        "shimmer":     "shimmer 1.8s infinite linear",
        "tip-pulse":   "tip-pulse 2s ease-in-out infinite",
        // V1 compat
        "fade-up":     "fade-up 0.4s ease-out forwards",
        "seal-stamp":  "seal-stamp 0.8s ease-out forwards",
        "xp-popup":    "xp-popup 1.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
