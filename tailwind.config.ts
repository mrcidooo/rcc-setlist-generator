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
        // No custom colors – rely on default grayscale palette
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.5rem",
      },
      boxShadow: {
        // Simple default shadows
        glass: "0 4px 30px rgba(0,0,0,0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        glass: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;