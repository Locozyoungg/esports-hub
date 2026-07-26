import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7c3aed",
          "purple-light": "#a78bfa",
          "purple-dark": "#5b21b6",
          pink: "#ec4899",
          gold: "#f59e0b",
          cyan: "#06b6d4",
          navy: "#0f0a2e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
