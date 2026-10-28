import { NextResponse } from "next/server";

// 中央氣象署開放資料平臺：潮汐預報（F-A0021-001，未來 1 個月的滿潮／乾潮時刻與潮高）。
// https://opendata.cwa.gov.tw/dataset/observation/F-A0021-001
const CWA_ENDPOINT =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001";

// 新北市貢寮區的鄉鎮潮汐預報（馬崗所在的行政區）。用 LocationId 查，不用
// LocationName：中文的 LocationName 參數會被氣象署的防火牆擋下（Request Rejected），
// LocationId 實測可用（2026-10-28）。
const GONGLIAO_LOCATION_ID = "65000260";

// 預報一天才更新一次，整個回應每小時重算一次就夠，不用每個訪客都打一次氣象署。
export const revalidate = 3600;

// 只回傳前後幾天，夠首頁畫出今天整天的潮汐曲線就好，不用把一整個月傳給瀏覽器。
const WINDOW_BEFORE_MS = 24 * 60 * 60 * 1000;
const WINDOW_AFTER_MS = 2 * 24 * 60 * 60 * 1000;

export type TideExtreme = {
  /** ISO 8601，帶 +08:00 */
  time: string;
  type: "high" | "low";
  /** 相對於當地平均海平面的潮高（公分） */
  heightCm: number;
};

export type TideResponse = {
  locationName: string;
  extremes: TideExtreme[];
};

type CwaTime = {
  DateTime: string;
  Tide: string;
  TideHeights: { AboveLocalMSL: number | string };
};

type CwaResponse = {
  records?: {
    TideForecasts?: {
      Location: {
        LocationName: string;
        TimePeriods: { Daily: { Time: CwaTime[] }[] };
      };
    }[];
  };
};

export async function GET() {
  const apiKey = process.env.CWA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CWA_API_KEY 尚未設定，請見 README 的環境變數說明。" },
      { status: 503 }
    );
  }

  const url = new URL(CWA_ENDPOINT);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("format", "JSON");
  url.searchParams.set("LocationId", GONGLIAO_LOCATION_ID);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: `氣象署 API 回應錯誤（${res.status}）` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as CwaResponse;
  const location = data.records?.TideForecasts?.[0]?.Location;
  if (!location) {
    return NextResponse.json({ error: "氣象署回應裡找不到貢寮區的潮汐預報" }, { status: 502 });
  }

  const now = Date.now();
  // Daily 不保證照日期排序（實測回傳順序是亂的），攤平後自己排。
  const extremes = location.TimePeriods.Daily.flatMap((day) => day.Time)
    .map((entry): TideExtreme => ({
      time: entry.DateTime,
      type: entry.Tide === "滿潮" ? "high" : "low",
      heightCm: Number(entry.TideHeights.AboveLocalMSL),
    }))
    .filter((entry) => {
      const t = Date.parse(entry.time);
      return (
        Number.isFinite(entry.heightCm) &&
        t >= now - WINDOW_BEFORE_MS &&
        t <= now + WINDOW_AFTER_MS
      );
    })
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

  const body: TideResponse = { locationName: location.LocationName, extremes };
  return NextResponse.json(body);
}
