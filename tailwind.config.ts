import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 全站色彩只能從這三個語意化 token 取用，其餘 Tailwind 預設色一律移除。
    // 2026-08 再次改版：從宋瓷天青換成「黎明潛水」色系——海女多半趁清晨潮水
    // 對的時候下水，橘色取自國際潛水浮標／安全旗的真實配色，不是隨意配色。
    colors: {
      transparent: "transparent",
      current: "currentColor",
      // 薄霧白：清晨海面上的霧氣冷白，不是純白
      stone: "#F0F3F2",
      // 深夜藍黑：下水前、天還沒亮的海色
      ink: "#0F1620",
      // 潛水浮標橘：真實的潛水安全裝備色，大面積、有信心地用
      accent: "#E0562B",
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
