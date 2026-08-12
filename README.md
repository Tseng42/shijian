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
  layout.tsx              root layout：字體、Lenis、Header/Footer
  page.tsx                首頁：Hero/Story/People/Craft/Map/Legacy
  people/page.tsx          人物誌列表
  people/[slug]/page.tsx   人物誌個別頁
  about/page.tsx           關於本專題
components/                各區塊元件
content/                   JSON 內容（people/、dictionaries/、story.json 等）
lib/content/                內容讀取（fs 讀 /content JSON）
lib/i18n/                   locale 設定與字典載入
middleware.ts                無 locale 前綴時導向 /zh
```

## 待補內容（已於程式碼標記 TODO）

- 正式 Logo SVG（`/public/logo.svg`，單色墨色版本）
- Hero 影片／靜態圖（`/public/placeholder-hero.mp4`、`placeholder-hero-poster.jpg`）
- 人物誌真實訪談內容與人像照（`content/people/*.json`，目前 `status: "pending"`）
- Map 據點實際座標與地名（`content/locations.json`）
- About 頁研究方法／訪談倫理聲明／資料來源正式文字（`content/about.json`）
- 品牌點綴色 `accent`（目前為暫定值 `#A85A34`，待實拍照片重新萃取後更新 `tailwind.config.ts`）

## 部署（Vercel）

零設定：Vercel 會自動偵測 Next.js 專案並執行 `next build`。目前沒有需要額外設定的環境變數或 `vercel.json`。

1. 推上 GitHub
2. 在 [vercel.com/new](https://vercel.com/new) import 這個 repo
3. Framework Preset 選 Next.js（會自動偵測），其餘保持預設即可
