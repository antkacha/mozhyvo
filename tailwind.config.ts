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
        primary: "#3B4FE8",
        "primary-dark": "#2D3DD6",
        "primary-light": "#EEF0FD",
        accent: "#FFD600",
        "accent-dark": "#E6C000",
        background: "#FAFAFA",
        foreground: "#0F0F0F",
        muted: "#6B7280",
        "muted-bg": "#F4F4F5",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        reveal: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float1: {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-6px) rotate(-2deg)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0px) rotate(3deg)" },
          "50%": { transform: "translateY(-6px) rotate(3deg)" },
        },
        float3: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-4px) rotate(-1deg)" },
        },
      },
      animation: {
        float1: "float1 4s ease-in-out infinite",
        float2: "float2 3.6s ease-in-out infinite 0.8s",
        float3: "float3 3.2s ease-in-out infinite 1.6s",
        reveal: "reveal 0.5s ease forwards",
        "slide-in-right": "slide-in-right 0.2s ease forwards",
        "fade-up": "fadeUp 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
