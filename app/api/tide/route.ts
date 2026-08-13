import { NextResponse } from "next/server";

// 中央氣象署開放資料平臺：潮汐預報（F-A0021-001）。
// https://opendata.cwa.gov.tw/dataset/observation/F-A0021-001
const CWA_ENDPOINT =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001";

export async function GET(request: Request) {
  const apiKey = process.env.CWA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CWA_API_KEY 尚未設定，請見 README 的環境變數說明。" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const locationName = searchParams.get("locationName");

  const url = new URL(CWA_ENDPOINT);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("format", "JSON");
  // TODO: 確認這個查詢參數名稱是否正確——去 Swagger 文件
  // （https://opendata.cwa.gov.tw/dist/opendata-swagger.html）用你自己的
  // API Key 實際打一次 F-A0021-001，對照回傳的 JSON 結構調整。
  if (locationName) url.searchParams.set("LocationName", locationName);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: `氣象署 API 回應錯誤（${res.status}）` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
