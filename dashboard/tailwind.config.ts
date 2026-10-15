import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    navy: { DEFAULT: "#13294B", 700: "#1C3A66", 50: "#EEF2F8" },
    sand: { DEFAULT: "#E9DCC3", 50: "#FBF7F0", 200: "#F3EBDC" },
    coral: { DEFAULT: "#E5634D", 600: "#C94C37", 50: "#FDEEEB" },
  } } },
  plugins: [],
} satisfies Config;
