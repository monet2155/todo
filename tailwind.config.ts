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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "xp-popup": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "20%": { opacity: "1", transform: "translateY(0) scale(1.1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1)" },
        },
      },
      animation: {
        "xp-popup": "xp-popup 1.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
