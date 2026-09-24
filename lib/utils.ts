import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 內容裡「2026 年 5 月」這種數字跟單位之間的真實空白字元，瀏覽器排版、
// 以及 GSAP SplitText 自己的斷字邏輯都會把它當成可斷行點，拆出「2026 年 5」
// 換行「月的訪談」的怪斷句——試過用不斷行空格（ ）取代，但 SplitText
// 內部用 \s 判斷字詞邊界，  也算在 \s 裡面，所以沒用，只能直接把
// 數字跟緊接在後的單一中文單位字之間的空白拿掉。對純英文字串是no-op。
export function keepNumberUnitTogether(text: string): string {
  return text
    .replace(/(\d)\s+([一-鿿])/g, "$1$2")
    .replace(/([一-鿿])\s+(\d)/g, "$1$2");
}
