import { NextResponse, type NextRequest } from "next/server";
import {
  DAY,
  TAIPEI_OFFSET,
  TIDE_PLACES,
  type TideDay,
  type TideExtreme,
  type TidePlace,
  type TideRange,
  type TideResponse,
} from "@/lib/tide";

export type { TideExtreme, TideResponse } from "@/lib/tide";

// 中央氣象署開放資料平臺：潮汐預報（F-A0021-001，未來 1 個月的滿潮／乾潮時刻與潮高）。
// https://opendata.cwa.gov.tw/dataset/observation/F-A0021-001
const CWA_ENDPOINT =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001";

// 用 LocationId 查，不用 LocationName：中文的 LocationName 參數會被氣象署的
// 防火牆擋下（Request Rejected），LocationId 實測可用（2026-10-28）。
// 預設是新北市貢寮區（馬崗所在的行政區）；?place= 可以換成 lib/tide.ts 列的其他預報點。

// 預報一天才更新一次，整個回應每小時重算一次就夠，不用每個訪客都打一次氣象署。
export const revalidate = 3600;

// 只回傳前後幾天，夠畫出今天整天的潮汐曲線就好，不用把一整個月傳給瀏覽器。
const WINDOW_BEFORE_MS = DAY;
const WINDOW_AFTER_MS = 2 * DAY;
// ?days= 最多給到一個月：氣象署這份預報本身就只涵蓋大約一個月。
const MAX_DAYS = 31;

const RANGE: Record<string, TideRange> = { 大: "spring", 中: "mid", 小: "neap" };

type CwaTime = {
  DateTime: string;
  Tide: string;
  TideHeights: { AboveLocalMSL: number | string };
};

type CwaDay = {
  Date?: string;
  TideRange?: string;
  Time: CwaTime[];
};

type CwaResponse = {
  records?: {
    TideForecasts?: {
      Location: {
        LocationName: string;
        TimePeriods: { Daily: CwaDay[] };
      };
    }[];
  };
};

function toExtreme(entry: CwaTime): TideExtreme {
  return {
    time: entry.DateTime,
    type: entry.Tide === "滿潮" ? "high" : "low",
    heightCm: Number(entry.TideHeights.AboveLocalMSL),
  };
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.CWA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CWA_API_KEY 尚未設定，請見 README 的環境變數說明。" },
      { status: 503 }
    );
  }

  const placeParam = request.nextUrl.searchParams.get("place") ?? "gongliao";
  if (!(placeParam in TIDE_PLACES)) {
    return NextResponse.json({ error: `不認得的地點：${placeParam}` }, { status: 400 });
  }
  const place = placeParam as TidePlace;
  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? 0);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(0, Math.floor(daysParam)), MAX_DAYS) : 0;

  const url = new URL(CWA_ENDPOINT);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("format", "JSON");
  url.searchParams.set("LocationId", TIDE_PLACES[place]);

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
    return NextResponse.json({ error: "氣象署回應裡找不到這個地點的潮汐預報" }, { status: 502 });
  }

  const now = Date.now();
  // Daily 不保證照日期排序（實測回傳順序是亂的），攤平後自己排。
  const extremes = location.TimePeriods.Daily.flatMap((day) => day.Time)
    .map(toExtreme)
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

  if (days > 0) {
    // 從台北時間的「今天」開始往後數 days 天；大中小潮是氣象署每天標好的。
    const today = new Date(now + TAIPEI_OFFSET).toISOString().slice(0, 10);
    body.days = location.TimePeriods.Daily.map((day): TideDay => {
      const date = (day.Date ?? day.Time[0]?.DateTime ?? "").slice(0, 10);
      return {
        date,
        range: RANGE[day.TideRange ?? ""] ?? null,
        lows: day.Time.map(toExtreme)
          .filter((e) => e.type === "low" && Number.isFinite(e.heightCm))
          .sort((a, b) => Date.parse(a.time) - Date.parse(b.time)),
      };
    })
      .filter((day) => day.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, days);
  }

  return NextResponse.json(body);
}
