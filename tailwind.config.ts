import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F5A623",
          50: "#FEF5E7",
          100: "#FDEBC9",
          200: "#FBD68E",
          300: "#F9C253",
          400: "#F7AD18",
          500: "#F5A623",
          600: "#D4891A",
          700: "#A66B14",
          800: "#784D0E",
          900: "#4A2F08",
        },
        background: "#0A0A0A",
        surface: {
          DEFAULT: "#141414",
          hover: "#1A1A1A",
          border: "#242424",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A0",
          muted: "#606060",
        },
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-gold": "pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 166, 35, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245, 166, 35, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
        "gradient-dark": "linear-gradient(135deg, #141414 0%, #0A0A0A 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, #141414 25%, #1F1F1F 50%, #141414 75%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(245, 166, 35, 0.3)",
        "gold-lg": "0 0 40px rgba(245, 166, 35, 0.2)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
