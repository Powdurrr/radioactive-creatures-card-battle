
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2DD4BF",
          hover: "#14B8A6",
        },
        secondary: {
          DEFAULT: "#818CF8",
          hover: "#6366F1",
        },
        accent: {
          DEFAULT: "#FCD34D",
          hover: "#FBBF24",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.9)",
          hover: "rgba(255, 255, 255, 1)",
        },
      },
      animation: {
        "card-hover": "card-hover 0.3s ease-in-out forwards",
        "fade-in": "fade-in 0.5s ease-in-out forwards",
        "slide-in": "slide-in 0.3s ease-in-out forwards",
        "transform": "transform 1s ease-in-out",
        "glow": "glow 1s ease-in-out",
      },
      keyframes: {
        "card-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-5px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "transform": {
          "0%": { 
            transform: "scale(1) rotate(0deg)",
            filter: "brightness(1)"
          },
          "50%": { 
            transform: "scale(1.2) rotate(180deg)",
            filter: "brightness(1.5)"
          },
          "100%": { 
            transform: "scale(1.1) rotate(360deg)",
            filter: "brightness(1.2)"
          }
        },
        "glow": {
          "0%": { 
            boxShadow: "0 0 0 0 rgba(45, 212, 191, 0.4)"
          },
          "50%": {
            boxShadow: "0 0 30px 10px rgba(45, 212, 191, 0.6)"
          },
          "100%": {
            boxShadow: "0 0 0 0 rgba(45, 212, 191, 0.4)"
          }
        }
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
