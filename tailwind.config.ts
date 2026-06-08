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
        primary: "#6C3BFF",
        "primary-dark": "#5528E8",
        "primary-light": "#EDE8FF",
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
    },
  },
  plugins: [],
};
export default config;
