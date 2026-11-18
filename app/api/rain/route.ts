import { NextResponse } from "next/server";

// 中央氣象署開放資料平臺：雨量觀測站-雨量資料（O-A0002-001，每 10 分鐘更新）。
// https://opendata.cwa.gov.tw/dataset/observation/O-A0002-001
const CWA_ENDPOINT =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001";

// 三貂角自動雨量站（C0A97，新北市貢寮區三貂角燈塔旁），離馬岡最近的雨量站。
// 站號出自氣象署雨量站清單 https://www.cwa.gov.tw/Data/js/rainfall/RainST_Info.js
const STATION_ID = "C0A97";

// 雨量 10 分鐘更新一次，回應也 10 分鐘重算一次。
export const revalidate = 600;

export type RainResponse = {
  stationName: string;
  /** 觀測時間，ISO 8601 */
  obsTime: string | null;
  /** 過去 1 小時累積雨量（毫米）；測站故障或沒有資料時是 null */
  past1hrMm: number | null;
};

type CwaStation = {
  StationName?: string;
  ObsTime?: { DateTime?: string };
  RainfallElement?: { Past1hr?: { Precipitation?: number | string } };
};

type CwaResponse = { records?: { Station?: CwaStation[] } };

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
  url.searchParams.set("StationId", STATION_ID);

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: `氣象署 API 回應錯誤（${res.status}）` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as CwaResponse;
  const station = data.records?.Station?.[0];
  if (!station) {
    return NextResponse.json({ error: "氣象署回應裡找不到三貂角雨量站" }, { status: 502 });
  }

  // 氣象署用負值（例如 -998）表示儀器故障或資料不明，當成沒有資料，不當成「沒下雨」。
  const raw = Number(station.RainfallElement?.Past1hr?.Precipitation);
  const body: RainResponse = {
    stationName: station.StationName ?? "三貂角",
    obsTime: station.ObsTime?.DateTime ?? null,
    past1hrMm: Number.isFinite(raw) && raw >= 0 ? raw : null,
  };
  return NextResponse.json(body);
}
