# 拾間 ShiJian

台灣北海岸海女文化畢業專題網站。品牌識別＋體驗設計，中英雙語（`/zh`、`/en`）。

## 技術棧

- Next.js 14（App Router）＋ TypeScript
- Tailwind CSS（`stone` / `ink` / `accent` 語意化色彩 token，見 `tailwind.config.ts`）
- GSAP + ScrollTrigger + SplitText、Lenis（平滑捲動）、Framer Motion
- 內容資料層：`/content` 下的 JSON（人物誌、Story/Craft/Legacy/About 文案、地點資訊、雙語字典），不寫死在元件裡

## 本機開發

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build   # 產生正式版
npm run start   # 以正式版模式啟動
npm run lint    # ESLint
```

## 專案結構

```
app/[locale]/            locale-based 路由（zh 預設、en）
  layout.tsx              root layout：字體、Lenis、Header/Footer、SoundProvider
  page.tsx                首頁：Hero/Story/People/Craft/Map/Legacy（維持不變，深度內容走獨立頁）
  people/page.tsx          人物誌列表
  people/[slug]/page.tsx   人物誌個別頁
  history/page.tsx         深度歷史（歷史脈絡／性別與季節分工／海女小故事）
  ecology/page.tsx         潮間帶生態與加工（石花菜／產業危機）
  atlas/page.tsx           文化網頁地圖（全站內容索引，連結在 Footer）
  experience/page.tsx      職人體驗預約表單（連結在 Craft 區塊／Atlas）
  about/page.tsx           關於本專題
app/api/tide/route.ts      潮汐資料代理（伺服器端呼叫氣象署 API，見下方環境變數）
components/                各區塊元件
content/                   JSON 內容（people/、dictionaries/、story.json 等）
lib/content/                內容讀取（fs 讀 /content JSON）
lib/i18n/                   locale 設定與字典載入
middleware.ts                無 locale 前綴時導向 /zh
```

## 待補內容（已於程式碼標記 TODO）

- 正式 Logo SVG（`/public/logo.svg`，單色墨色版本）與正式 favicon（目前 `app/favicon.ico` 仍是 Next.js 預設圖示）
- Hero 影片／靜態圖（`/public/placeholder-hero.mp4`、`placeholder-hero-poster.jpg`）
- 人物誌真實訪談內容與人像照（`content/people/*.json`，目前 3 位皆為 `status: "pending"`：工作室創辦人、當地阿嬤、罔市阿嬤）
- Map 據點實際座標與地名（`content/locations.json`）
- About 頁研究方法／訪談倫理聲明／資料來源正式文字（`content/about.json`）
- 品牌點綴色 `accent`（目前為暫定值 `#A85A34`，待實拍照片重新萃取後更新 `tailwind.config.ts`；注意此色與 `stone` 背景的對比度為 4.42:1，一般文字未達 WCAG AA 的 4.5:1，重新萃取時建議留意）
- Legacy 區塊的保存行動 CTA 按鈕已先移除（原本沒有目的地連結），待有實際連結後再補上
- `/history`、`/ecology` 的正式研究文字（`content/history.json`、`content/ecology.json`，目前全為佔位文字）
- 潮間帶生態頁的小遊戲（規劃中，先不做，見下方待辦）

## 環境變數

- `NEXT_PUBLIC_SITE_URL`：正式網域（例如 `https://shijian.vercel.app`），供 `metadataBase`、`sitemap.xml`、`robots.txt`、Open Graph 連結使用。部署後請在 Vercel 專案設定中加入，本機開發未設定時預設為 `http://localhost:3000`。
- `CWA_API_KEY`：中央氣象署開放資料平臺的 API 授權碼，供 `app/api/tide/route.ts`（潮汐資料代理）使用。**免費**，申請步驟：
  1. 到 [opendata.cwa.gov.tw](https://opendata.cwa.gov.tw) 用 email 註冊會員
  2. 登入後點「會員資訊」→「API 授權碼」→「取得授權碼」，立即產生一組金鑰
  3. 在專案根目錄建立 `.env.local`（此檔案已在 `.gitignore` 中，不會被推上 GitHub），寫入：
     ```
     CWA_API_KEY=你剛取得的授權碼
     ```
  4. 重啟 `npm run dev`，打開 `http://localhost:3000/api/tide?locationName=貢寮區` 測試
  - 這支 API 為什麼要走伺服器端 route（`app/api/tide/route.ts`）而不是前端直接呼叫氣象署：金鑰一旦寫進前端程式碼，任何人打開瀏覽器開發者工具就能看到並盜用；走 Next.js API route，金鑰只存在伺服器環境變數裡，瀏覽器完全看不到。
  - 目前 `LocationName` 這個查詢參數名稱是否正確、實際回傳的 JSON 欄位長怎樣，我還沒有金鑰可以實測——你申請到金鑰後，用瀏覽器打開上面測試網址，把回傳的 JSON 貼給我，我再幫你把資料實際渲染到 Map 頁面。
- `NEXT_PUBLIC_FORMSPREE_ID`：`/experience` 職人體驗預約表單的送出端點。**免費**，申請步驟：
  1. 到 [formspree.io](https://formspree.io) 免費註冊
  2. 建立一個新表單（New Form），複製它給你的表單 ID（網址或設定頁會顯示，格式類似 `xrgpqwa`）
  3. 在 `.env.local` 加入：
     ```
     NEXT_PUBLIC_FORMSPREE_ID=你的表單ID
     ```
  4. 重啟 `npm run dev`，打開 `/zh/experience` 測試送出——Formspree 免費方案每月有送出次數上限，超過需升級
  - 沒設定這個變數時，表單會顯示「表單尚未設定完成」，不會壞掉，但也不能用——上線前記得設定

## 部署（Vercel）

Vercel 會自動偵測 Next.js 專案並執行 `next build`。

1. 推上 GitHub
2. 在 [vercel.com/new](https://vercel.com/new) import 這個 repo
3. Framework Preset 選 Next.js（會自動偵測）
4. 設定環境變數 `NEXT_PUBLIC_SITE_URL` 為正式網域，其餘保持預設即可
