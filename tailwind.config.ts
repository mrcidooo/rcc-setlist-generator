import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Deep indigo primary palette
        indigo: {
          50: "#f0f4ff",
          100: "#d9e2ff",
          200: "#b3c5ff",
          300: "#8da9ff",
          400: "#668cff",
          500: "#406fff",
          600: "#2a57cc",
          700: "#1e418f",
          800: "#122c52",
          900: "#061416",
        },
        // Soft neutrals for neumorphism
        "neumorph-bg": "hsl(var(--neumorph-bg, 210 40% 98%))",
        "neumorph-shadow": "hsl(var(--neumorph-shadow, 210 40% 90%))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.5rem",
      },
      boxShadow: {
        // Soft neumorphic shadow
        "neumorph-light":
          "8px 8px 16px var(--neumorph-shadow), -8px -8px 16px var(--neumorph-bg)",
        // Subtle glass‑morphism elevation
        "glass": "0 4px 30px rgba(0,0,0,0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      // Glass‑morphism utilities
      backgroundImage: {
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;