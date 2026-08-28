import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 全站色彩只能從這三個語意化 token 取用，其餘 Tailwind 預設色一律移除。
    // 2026-08 改版：色相從墨黑／硃紅換成宋瓷「天青」系統，且刻意反過來——
    // accent 這次不用只當小面積印章色，可以大面積、有信心地用（見 PRODUCT.md 重新設計方向）。
    colors: {
      transparent: "transparent",
      current: "currentColor",
      // 月白：宋瓷開片的冷白，不是純白
      stone: "#EDEFEA",
      // 深墨，微帶藍灰，不是純黑
      ink: "#22262B",
      // 天青：雨過天青的瓷器藍灰，這次是主色，不是小面積印章色
      accent: "#3E6472",
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
