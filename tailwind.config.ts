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
        canvas: "#F8F6F3",
        ink: "#1A1A1A",
        muted: "#8A8480",
        "muted-light": "#C4C0BC",
        "block-bg": "#F0EDE8",
        accent: "#CDFF50",
        "structure-line": "#1A1A1A",
      },
      fontFamily: {
        serif: ["Noto Serif KR", "serif"],
        sans: ["Pretendard", "sans-serif"],
      },
      fontSize: {
        essence: ["28px", { lineHeight: "1.7", fontWeight: "500" }],
        "essence-sm": ["24px", { lineHeight: "1.7", fontWeight: "500" }],
      },
      borderWidth: {
        structure: "1.5px",
      },
    },
  },
  plugins: [],
};
export default config;
