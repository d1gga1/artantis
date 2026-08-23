import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0d1420",
          soft: "#3d4a5c",
          faint: "#6b7889",
        },
        paper: {
          DEFAULT: "#ffffff",
          warm: "#fbfcfd",
          sunk: "#f2f5f8",
        },
        line: {
          DEFAULT: "#e4e9ef",
          strong: "#d3dae3",
        },
        accent: {
          DEFAULT: "#0f6f8c",
          soft: "#e6f2f6",
          deep: "#0a4f65",
        },
        signal: {
          ok: "#12795d",
          warn: "#a86a12",
          bad: "#b3352f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,20,32,0.04), 0 8px 24px -12px rgba(13,20,32,0.12)",
        lift: "0 2px 4px rgba(13,20,32,0.05), 0 24px 48px -20px rgba(13,20,32,0.22)",
        ring: "0 0 0 1px rgba(15,111,140,0.18), 0 12px 32px -16px rgba(15,111,140,0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition: "800px 0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
