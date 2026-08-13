import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 全站色彩只能從這三個語意化 token 取用，其餘 Tailwind 預設色一律移除
    colors: {
      transparent: "transparent",
      current: "currentColor",
      // 檔案白：接近白但不是純白，墨黑，硃紅只當印章色用（很少大面積使用）
      stone: "#FCFCFA",
      ink: "#1A1A1A",
      accent: "#B23A2E",
    },
    extend: {
      fontFamily: {
        "heading-zh": ["var(--font-noto-sans-tc)", "sans-serif"],
        "body-zh": ["var(--font-noto-serif-tc)", "serif"],
        "heading-en": ["var(--font-fraunces)", "serif"],
        "body-en": ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
