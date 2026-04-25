import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B00",
          "orange-light": "#FF8C38",
          dark: "#0A0A0A",
          "dark-card": "#141414",
          "dark-border": "#2A2A2A",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #FF6B00 0%, #FF8C38 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
