import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "eco-bg": "#0e1216",
        "eco-mint": "#2ff7c8",
        "eco-teal": "#20c7c7"
      }
    }
  },
  plugins: []
} satisfies Config;
