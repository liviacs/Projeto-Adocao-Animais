import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        emerald: {
          50:  "var(--cor-50)",
          100: "var(--cor-100)",
          200: "var(--cor-200)",
          300: "var(--cor-400)",
          400: "var(--cor-400)",
          500: "var(--cor-500)",
          600: "var(--cor-600)",
          700: "var(--cor-700)",
          800: "var(--cor-800)",
          900: "var(--cor-900)",
          950: "var(--cor-950)",
        },
      },
    },
  },
  plugins: [],
}

export default config
