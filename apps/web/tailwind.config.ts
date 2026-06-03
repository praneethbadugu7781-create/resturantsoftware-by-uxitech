import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        leaf: "#246b45",
        saffron: "#d28a24",
        clay: "#b6533c",
        mist: "#eef3ef"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
