// 放在獨立的 lib 檔、不放在 TideProgress.tsx 裡：那支是 "use client" 模組，
// 伺服器元件（例如 loading.tsx 用的 GelidiumSprig）從它 import 常數只會拿到
// client reference，不是真的陣列。
// 七泡七曬：石花菜從深紫褐曬到亮麗米白的七個真實色階（取自 craft.json／
// ecology.json 記錄的顏色變化），是全站唯一直接借用這道台灣特有工序本身、
// 而非通用特效樣板的視覺訊號。捲動進度條依序帶過這七色，等於讓訪客
// 「捲」過一次石花菜曬乾的過程。刻意不當作全站底色使用——七泡七曬的顏色
// 只用在這條細細的進度條、首頁「潮汐」段的曬褪字（sun-fade-text.tsx）、
// Craft 的泡曬步驟、敲打換頁（PageTransition.tsx）和載入畫面的石花菜
// （GelidiumSprig.tsx）上，不動檔案白本身的識別。
export const TIDE_COLORS = [
  "#4A2E28", // 深紫／深褐
  "#7A3F2E", // 棕紅
  "#A66B3E", // 淺咖啡／黃褐
  "#C79447", // 土黃
  "#DDB662", // 鵝黃／淡奶油
  "#EAD08C", // 米黃
  "#F5EDD6", // 亮麗米白
];
