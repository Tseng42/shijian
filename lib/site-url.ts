// 網站的正式網址，給 metadataBase（canonical、Open Graph 圖片）、sitemap.xml、
// robots.txt 用。這些地方都必須是完整的對外網址，寫成 localhost 的話，
// 分享到 LINE／Facebook 抓不到預覽圖，搜尋引擎也會收到錯的正式網址。
//
// 優先順序：
// 1. NEXT_PUBLIC_SITE_URL：手動指定（例如之後換成自己的網域，想明確寫死）。
// 2. Vercel 自動提供的專案正式網域（不含 https://）。官方文件說這個變數就是
//    拿來產生「指向正式站」的連結，例如 OG 圖片網址；預覽部署也會拿到正式網域，
//    不會把預覽網址寫進 canonical。
//    https://vercel.com/docs/environment-variables/system-environment-variables
// 3. 本機開發：http://localhost:3000。
const productionHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (productionHost ? `https://${productionHost}` : "http://localhost:3000")
).replace(/\/+$/, "");
