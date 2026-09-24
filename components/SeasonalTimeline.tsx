import type { TimelineEntry } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

// 簡單的橫向時間軸：把「2 到 4 月採青苔、4 到 7 月石花菜盛產、8 月後轉採
// 麒麟菜」這類散文式的季節日曆，改成一眼能看懂分段的視覺化條列。
// 三段用等寬呈現（月份區間本身就是概略的口述經驗，不是精確統計數字，
// 沒有必要按天數比例畫寬度，等寬反而更誠實）。
export default function SeasonalTimeline({
  entries,
  locale,
}: {
  entries: TimelineEntry[];
  locale: Locale;
}) {
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  return (
    <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ink/10 sm:grid-cols-3">
      {entries.map((entry, index) => {
        const period = locale === "zh" ? entry.period_zh : entry.period_en;
        const label = locale === "zh" ? entry.label_zh : entry.label_en;

        return (
          <li key={index} className="border-t-2 border-accent bg-stone px-5 py-5">
            <p className="font-body-en text-xs uppercase tracking-widest text-accent">
              {period}
            </p>
            <p className={`${bodyFont} mt-1 text-base font-bold text-ink`}>
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
