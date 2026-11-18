"use client";

import { useEffect, useState } from "react";
import ExperienceForm from "@/components/ExperienceForm";
import type { Locale } from "@/lib/i18n/config";
import type { TideDay, TideRange, TideResponse } from "@/lib/tide";

type FormLabels = React.ComponentProps<typeof ExperienceForm>["labels"];

export type TideCalendarLabels = {
  title: string;
  hint: string;
  pick: string;
  spring: string;
  mid: string;
  neap: string;
  low: string;
  noDaytimeLow: string;
  season: string;
  disclaimer: string;
  source: string;
  fill: string;
  fillLow: string;
};

const DAYS = 30;
// 只列白天的乾潮：晚上下水不安全，也不會是體驗的時段（我們的判斷，不是正式標準）。
const DAYTIME_FROM = 6;
const DAYTIME_TO = 18;

const RANGE_STYLE: Record<TideRange, string> = {
  spring: "bg-accent text-stone",
  mid: "bg-ink/10 text-ink/80",
  neap: "border border-ink/20 text-ink/60",
};

/**
 * 職人體驗預約：表單上面先放一排未來 30 天的潮汐，標出大潮的日子——大潮退潮
 * 最低、露出的潮間帶最多，是判潮下水的基本功（ecology.json「季節與判潮」）。
 * 點一天就把日期和乾潮時刻填進「希望預約的時段」，訪客還是可以自己改。
 * 拿不到潮汐資料（例如還沒設定 CWA_API_KEY）時，日期條整塊不顯示，表單照常。
 */
export default function ExperienceBooking({
  locale,
  formLabels,
  calendarLabels,
}: {
  locale: Locale;
  formLabels: FormLabels;
  calendarLabels: TideCalendarLabels;
}) {
  const [days, setDays] = useState<TideDay[] | null>(null);
  const [timeframe, setTimeframe] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  // 表單沒設定好的時候不會出現，點日期也沒有地方可以填，日期條就只當參考資訊。
  const selectable = !!process.env.NEXT_PUBLIC_FORMSPREE_ID;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tide?days=${DAYS}`)
      .then((res) => (res.ok ? (res.json() as Promise<TideResponse>) : null))
      .then((data) => {
        if (!cancelled && data?.days?.length) setDays(data.days);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const intl = locale === "zh" ? "zh-TW" : "en-GB";
  // 日期是台北的日曆日，用 UTC 正午建 Date、再用 UTC 格式化，不管訪客在哪個時區都不會差一天。
  const asDate = (date: string) => new Date(`${date}T12:00:00Z`);
  const dateShort = new Intl.DateTimeFormat(intl, { month: "numeric", day: "numeric", timeZone: "UTC" });
  const dateLong = new Intl.DateTimeFormat(intl, {
    year: "numeric",
    month: locale === "zh" ? "numeric" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const weekday = new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" });
  const time = new Intl.DateTimeFormat(intl, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  });
  const taipeiHour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: "Asia/Taipei",
  });

  const daytimeLows = (day: TideDay) =>
    day.lows.filter((low) => {
      const h = Number(taipeiHour.format(new Date(low.time)));
      return h >= DAYTIME_FROM && h < DAYTIME_TO;
    });
  const rangeLabel = (range: TideRange) => calendarLabels[range];

  const pickDay = (day: TideDay) => {
    const lows = daytimeLows(day);
    const date = asDate(day.date);
    let text = calendarLabels.fill
      .replace("{date}", dateLong.format(date))
      .replace("{weekday}", weekday.format(date))
      .replace("{range}", day.range ? rangeLabel(day.range) : "");
    if (lows.length) {
      text += calendarLabels.fillLow.replace(
        "{times}",
        lows.map((low) => time.format(new Date(low.time))).join(locale === "zh" ? "、" : ", ")
      );
    }
    setSelected(day.date);
    setTimeframe(text);
  };

  return (
    <>
      {days && (
        <section aria-labelledby="tide-calendar-title" className="animate-tide-line-in mb-14">
          <h2 id="tide-calendar-title" className="font-body-en text-xs uppercase tracking-widest text-ink/50">
            {calendarLabels.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            {calendarLabels.hint}
            {selectable && `${locale === "zh" ? "" : " "}${calendarLabels.pick}`}
          </p>

          <ol className="-mx-6 mt-5 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-3 md:mx-0 md:scroll-px-0 md:px-0">
            {days.map((day) => {
              const date = asDate(day.date);
              const lows = daytimeLows(day);
              const isSpring = day.range === "spring";
              const isSelected = selected === day.date;
              const content = (
                <>
                  <span className="block text-[0.7rem] text-ink/50">{weekday.format(date)}</span>
                  <span className="font-heading-en block text-lg tabular-nums text-ink">
                    {dateShort.format(date)}
                  </span>
                  {day.range && (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[0.65rem] ${RANGE_STYLE[day.range]}`}
                    >
                      {rangeLabel(day.range)}
                    </span>
                  )}
                  <span className="mt-2 block text-[0.65rem] leading-snug text-ink/60">
                    {lows.length ? (
                      <>
                        {calendarLabels.low}
                        {lows.map((low) => (
                          <span key={low.time} className="block tabular-nums text-ink/80">
                            {time.format(new Date(low.time))}
                          </span>
                        ))}
                      </>
                    ) : (
                      calendarLabels.noDaytimeLow
                    )}
                  </span>
                </>
              );
              // flex 直排、靠上：<button> 預設會把內容垂直置中，跟沒有乾潮那格的高度對不齊。
              const cellClass = `flex h-full w-[5.5rem] flex-col items-start rounded-lg border px-3 py-3 text-left font-body-en transition-colors ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : isSpring
                    ? "border-accent/40 bg-stone"
                    : "border-ink/10 bg-stone"
              }`;

              return (
                <li key={day.date} className="shrink-0 snap-start">
                  {selectable ? (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => pickDay(day)}
                      className={`${cellClass} outline-none hover:border-accent focus-visible:border-accent`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className={cellClass}>{content}</div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-3 max-w-xl space-y-1 text-xs leading-relaxed text-ink/60">
            <p>{calendarLabels.season}</p>
            <p>{calendarLabels.disclaimer}</p>
            <p className="text-ink/45">{calendarLabels.source}</p>
          </div>
        </section>
      )}

      <ExperienceForm labels={formLabels} timeframe={timeframe} onTimeframeChange={setTimeframe} />
    </>
  );
}
