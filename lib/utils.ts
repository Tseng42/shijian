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

// 中文排版的「懸掛標點」問題：像「——」被拆到下一行開頭，是標準中文排版
// 不該出現的孤兒標點。CSS 的 line-break: strict 照理該擋掉，但 GSAP
// SplitText 是自己量測文字再手動分行，不會照著這條 CSS 規則走，所以還是
// 會斷出來。用 word joiner（U+2060，零寬度、不能在此處斷行的字元）把
// 破折號跟緊鄰的字「黏」在一起。
//
// 注意：同樣的技巧套用在逗號、句號等一般標點上並不可靠——實測發現
// Noto Serif TC 這個字型对 U+2060／U+00A0／U+FEFF 都會觸發字型 fallback
// 換字型渲染，反而讓瀏覽器在那個位置重新斷行，等於沒修到。要完整解決
// 需要真的用 <span style="white-space:nowrap"> 包住文字（HTML 結構層級
// 的修法），而不是塞不可見字元，這已超出這次修正的範圍。
const WORD_JOINER = "⁠";

export function preventDashOrphan(text: string): string {
  return text.replace(
    new RegExp(`([^\\s${WORD_JOINER}])(—{1,2})([^\\s${WORD_JOINER}])`, "g"),
    `$1${WORD_JOINER}$2${WORD_JOINER}$3`
  );
}

export function fixChineseTypography(text: string): string {
  return preventDashOrphan(keepNumberUnitTogether(text));
}
