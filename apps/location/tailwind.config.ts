import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F7A831",
          "orange-hover": "#e5961d",
          cyan: "#0082CA",
          "cyan-light": "#00AFEC",
          dark: "#1A1A1A",
          gray: "#F5F5F5",
          gold: "#D4AF37",
          "gold-hover": "#B8860B",
          peach: "#FFFAF0",
          surface: "#fafafa",
          border: "#e5e5e5",
        },
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
      },
    },
  },
};

export default config;
