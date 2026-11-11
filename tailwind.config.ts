import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07060b",
        panel: "#0f0d16",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        neon: "var(--neon)",
        accent: "var(--accent)",
        kick: "#53fc18",
      },
      fontFamily: {
        sans: ["var(--font-ar)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-ar)", "sans-serif"],
      },
      maxWidth: { site: "1200px" },
    },
  },
  plugins: [],
};
export default config;
