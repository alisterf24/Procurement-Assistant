import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mahindra: {
          red: "#d71920",
          deep: "#9f1017",
          ink: "#24272c",
          charcoal: "#343a40",
          line: "#e7e9ed",
          mist: "#f5f6f8"
        }
      },
      boxShadow: {
        panel: "0 16px 42px rgba(36, 39, 44, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
