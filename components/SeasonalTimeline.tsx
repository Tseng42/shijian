"use client";

import { useEffect, useState } from "react";
import type { TimelineEntry } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";
import type { RainResponse } from "@/app/api/rain/route";

export type SeasonalTimelineLabels = {
  /** 「現在 · {month}」 */
  now: string;
  /** 下雨彩蛋，{mm} 換成過去一小時雨量 */
  rain: string;
};

// 簡單的橫向時間軸：把「2 到 4 月採青苔、4 到 7 月石花菜盛產、8 月後轉採
// 麒麟菜」這類散文式的季節日曆，改成一眼能看懂分段的視覺化條列。
// 三段用等寬呈現（月份區間本身就是概略的口述經驗，不是精確統計數字，
// 沒有必要按天數比例畫寬度，等寬反而更誠實）。
//
// 時間軸是活的：訪客打開網頁的當月（台北時間）落在哪一段，那一段就亮起來。
// 月份在瀏覽器裡算，伺服器先畫沒有標示的版本，避免快取的頁面標錯月份。
// 馬崗旁的三貂角雨量站過去一小時有雨，就在下面補一句：淋到雨的石花菜會轉綠、
// 發霉（ecology.json「七泡七曬」段落）。沒下雨或拿不到資料就什麼都不顯示。
export default function SeasonalTimeline({
  entries,
  locale,
  labels,
}: {
  entries: TimelineEntry[];
  locale: Locale;
  labels: SeasonalTimelineLabels;
}) {
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";
  const [month, setMonth] = useState<number | null>(null);
  const [rainMm, setRainMm] = useState<number | null>(null);

  useEffect(() => {
    const taipeiMonth = Number(
      new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: "Asia/Taipei" }).format(new Date())
    );
    setMonth(taipeiMonth);

    let cancelled = false;
    fetch("/api/rain")
      .then((res) => (res.ok ? (res.json() as Promise<RainResponse>) : null))
      .then((data) => {
        if (!cancelled && data?.past1hrMm && data.past1hrMm > 0) setRainMm(data.past1hrMm);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const monthName =
    month === null
      ? ""
      : locale === "zh"
        ? `${month} 月`
        : new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(
            new Date(Date.UTC(2026, month - 1, 1))
          );
  const nowLabel = labels.now.replace("{month}", monthName);
  const matched = month !== null && entries.some((entry) => entry.months?.includes(month));

  return (
    <div className="mt-10">
      <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ink/10 sm:grid-cols-3">
        {entries.map((entry, index) => {
          const period = locale === "zh" ? entry.period_zh : entry.period_en;
          const label = locale === "zh" ? entry.label_zh : entry.label_en;
          const isNow = month !== null && !!entry.months?.includes(month);

          return (
            <li
              key={index}
              aria-current={isNow ? "date" : undefined}
              className={`relative border-t-2 border-accent px-5 py-5 transition-colors duration-700 ${
                isNow ? "bg-accent/10" : "bg-stone"
              }`}
            >
              <p className="font-body-en text-xs uppercase tracking-widest text-accent">{period}</p>
              <p className={`${bodyFont} mt-1 text-base font-bold text-ink`}>{label}</p>
              {isNow && (
                <p className="font-body-en mt-3 inline-flex items-center gap-2 text-xs text-ink/70">
                  <span className="animate-tide-buoy inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(224,86,43,0.25)]" />
                  {nowLabel}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {/* 1 月不在任何一段（口述資料沒提到），只寫現在幾月，不硬塞進某一段。 */}
      {month !== null && !matched && (
        <p className="font-body-en mt-3 text-xs text-ink/60">{nowLabel}</p>
      )}

      {rainMm !== null && (
        <p role="status" className={`${bodyFont} mt-4 flex items-start gap-2 text-sm leading-relaxed text-ink/70`}>
          <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-ink/50">
            <path d="M8 1.5C8 1.5 3 7.2 3 10.2a5 5 0 0 0 10 0C13 7.2 8 1.5 8 1.5Z" fill="currentColor" />
          </svg>
          {labels.rain.replace("{mm}", String(rainMm))}
        </p>
      )}
    </div>
  );
}
