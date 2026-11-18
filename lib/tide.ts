// 潮汐資料的共用型別與推算：/api/tide 回傳的格式，加上首頁潮位卡、北海岸
// 四個地點、職人體驗日期條共用的「任意時刻潮高」算法。放在獨立的 lib 檔，
// 伺服器路由跟瀏覽器元件都能 import。

export type TideExtreme = {
  /** ISO 8601，帶 +08:00 */
  time: string;
  type: "high" | "low";
  /** 相對於當地平均海平面的潮高（公分） */
  heightCm: number;
};

/** 氣象署每天標的潮差等級：大潮／中潮／小潮。 */
export type TideRange = "spring" | "mid" | "neap";

export type TideDay = {
  /** YYYY-MM-DD（台北時間） */
  date: string;
  range: TideRange | null;
  /** 這一天的乾潮（不分白天晚上，前端自己挑） */
  lows: TideExtreme[];
};

export type TideResponse = {
  locationName: string;
  extremes: TideExtreme[];
  /** 只有帶 ?days= 查詢時才有 */
  days?: TideDay[];
};

/**
 * 地點 → 氣象署潮汐預報的 LocationId。和平島、八斗子各有自己的預報點；
 * 卯澳、馬崗都在貢寮區，用同一個鄉鎮預報，所以這兩個地點的數字會一樣。
 */
export const TIDE_PLACES = {
  gongliao: "65000260", // 新北市貢寮區（馬崗、卯澳）
  heping: "A01000", // 海水浴場和平島
  badouzi: "I00200", // 漁港八斗子
} as const;

export type TidePlace = keyof typeof TIDE_PLACES;

/** 首頁「北海岸」四個地點各自對應哪個預報點。 */
export const LOCATION_TIDE_PLACE: Record<string, TidePlace> = {
  "heping-island": "heping",
  badouzi: "badouzi",
  maoao: "gongliao",
  magang: "gongliao",
};

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
// 台灣沒有日光節約時間，台北時間固定是 UTC+8。
export const TAIPEI_OFFSET = 8 * HOUR;

/**
 * 兩個滿乾潮之間用半個餘弦補出中間的潮高——潮汐表只給轉折點，這是航海上
 * 從潮汐表推算任意時刻潮高的標準近似法（跟「十二分之一法則」是同一條曲線）。
 */
export function heightAt(extremes: TideExtreme[], t: number): number | null {
  for (let i = 0; i < extremes.length - 1; i++) {
    const a = Date.parse(extremes[i].time);
    const b = Date.parse(extremes[i + 1].time);
    if (t >= a && t <= b) {
      const f = (t - a) / (b - a);
      const ha = extremes[i].heightCm;
      const hb = extremes[i + 1].heightCm;
      return ha + ((hb - ha) * (1 - Math.cos(Math.PI * f))) / 2;
    }
  }
  return null;
}

/** 此刻的潮高、漲退、下一個滿乾潮，以及今天（台北時間）的最高最低，畫水位條用。 */
export function tideNow(extremes: TideExtreme[], now: number) {
  const current = heightAt(extremes, now);
  if (current === null) return null;
  const next = extremes.find((e) => Date.parse(e.time) > now) ?? null;

  const dayStart = Math.floor((now + TAIPEI_OFFSET) / DAY) * DAY - TAIPEI_OFFSET;
  const heights: number[] = [];
  for (let t = dayStart; t <= dayStart + DAY; t += 15 * 60 * 1000) {
    const h = heightAt(extremes, t);
    if (h !== null) heights.push(h);
  }
  const lo = heights.length ? Math.min(...heights) : current;
  const hi = heights.length ? Math.max(...heights) : current;

  return {
    current,
    rising: next?.type === "high",
    next,
    dayStart,
    todayLow: lo,
    todayHigh: hi,
  };
}

export function formatSignedCm(cm: number) {
  const rounded = Math.round(cm);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : "±"}${Math.abs(rounded)}`;
}
