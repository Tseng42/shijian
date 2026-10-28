"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { TideExtreme, TideResponse } from "@/app/api/tide/route";

export type TideLabels = {
  label: string;
  rising: string;
  falling: string;
  nextHigh: string;
  nextLow: string;
  source: string;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// 台灣沒有日光節約時間，台北時間固定是 UTC+8。訪客不管在哪個時區，
// 曲線都畫馬崗當地的「今天」。
const TAIPEI_OFFSET = 8 * HOUR;

const VIEW_W = 240;
const VIEW_H = 44;
const PAD_Y = 6;

/**
 * 兩個滿乾潮之間用半個餘弦補出中間的潮高——潮汐表只給轉折點，這是航海上
 * 從潮汐表推算任意時刻潮高的標準近似法（跟「十二分之一法則」是同一條曲線）。
 */
function heightAt(extremes: TideExtreme[], t: number): number | null {
  for (let i = 0; i < extremes.length - 1; i++) {
    const a = Date.parse(extremes[i].time);
    const b = Date.parse(extremes[i + 1].time);
    if (t >= a && t <= b) {
      const f = (t - a) / (b - a);
      const ha = extremes[i].heightCm;
      const hb = extremes[i + 1].heightCm;
      return ha + (hb - ha) * (1 - Math.cos(Math.PI * f)) / 2;
    }
  }
  return null;
}

/**
 * 判潮：首頁 Hero 左下角的一條真實潮汐線。曲線是馬崗所在的貢寮區今天整天的
 * 潮汐預報，浮標（潛水浮標橘）停在「此刻」的潮位上，每分鐘跟著真實時間往前走。
 * 拿不到資料（例如還沒設定 CWA_API_KEY）就整塊不顯示——寧可沒有，也不放假的潮位。
 */
export default function TideLine({
  labels,
  locale,
  className = "",
}: {
  labels: TideLabels;
  locale: Locale;
  className?: string;
}) {
  const [extremes, setExtremes] = useState<TideExtreme[] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tide")
      .then((res) => (res.ok ? (res.json() as Promise<TideResponse>) : null))
      .then((data) => {
        if (!cancelled && data && data.extremes.length >= 2) setExtremes(data.extremes);
      })
      .catch(() => {});
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const view = useMemo(() => {
    if (!extremes) return null;
    const current = heightAt(extremes, now);
    if (current === null) return null;

    const dayStart = Math.floor((now + TAIPEI_OFFSET) / DAY) * DAY - TAIPEI_OFFSET;
    const samples: { t: number; h: number }[] = [];
    for (let t = dayStart; t <= dayStart + DAY; t += 15 * 60 * 1000) {
      const h = heightAt(extremes, t);
      if (h !== null) samples.push({ t, h });
    }
    if (samples.length < 2) return null;

    const heights = samples.map((s) => s.h);
    const lo = Math.min(...heights);
    const hi = Math.max(...heights);
    const span = Math.max(hi - lo, 1);
    const x = (t: number) => ((t - dayStart) / DAY) * VIEW_W;
    const y = (h: number) => PAD_Y + (1 - (h - lo) / span) * (VIEW_H - PAD_Y * 2);

    const line = samples
      .map((s, i) => `${i === 0 ? "M" : "L"}${x(s.t).toFixed(1)},${y(s.h).toFixed(1)}`)
      .join(" ");
    const area = `${line} L${x(samples.at(-1)!.t).toFixed(1)},${VIEW_H} L${x(samples[0].t).toFixed(1)},${VIEW_H} Z`;

    const next = extremes.find((e) => Date.parse(e.time) > now) ?? null;

    return {
      line,
      area,
      nowX: x(now),
      nowY: y(current),
      current: Math.round(current),
      rising: next?.type === "high",
      next,
    };
  }, [extremes, now]);

  if (!view) return null;

  const timeFormat = new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  });
  const signed = `${view.current > 0 ? "+" : view.current < 0 ? "−" : "±"}${Math.abs(view.current)}`;

  return (
    <div
      className={`animate-tide-line-in rounded-2xl border border-stone/15 bg-ink/45 px-4 py-3 text-stone backdrop-blur-sm ${className}`}
    >
      <p className="font-body-en text-[0.65rem] uppercase tracking-[0.22em] text-stone/60">
        {labels.label}
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-heading-en text-2xl tabular-nums">{signed}</span>
        <span className="font-body-en text-xs text-stone/70">cm</span>
        <span className="font-body-en ml-1 text-xs text-stone/80">
          {view.rising ? `↑ ${labels.rising}` : `↓ ${labels.falling}`}
        </span>
      </p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-2 h-11 w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="tide-line-past">
            <rect x="0" y="0" width={view.nowX} height={VIEW_H} />
          </clipPath>
        </defs>
        {/* 已經過去的時段填上水色，還沒到的只畫線：看得出「現在漲到哪了」。 */}
        <path d={view.area} className="fill-stone/15" clipPath="url(#tide-line-past)" />
        <path
          d={view.line}
          className="fill-none stroke-stone/60"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* 浮標放在 SVG 外面，免得被 preserveAspectRatio="none" 壓成橢圓。 */}
      <div className="relative -mt-11 h-11" aria-hidden="true">
        <span
          className="animate-tide-buoy absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(224,86,43,0.25)]"
          style={{
            left: `${(view.nowX / VIEW_W) * 100}%`,
            top: `${(view.nowY / VIEW_H) * 100}%`,
          }}
        />
      </div>

      {view.next && (
        <p className="font-body-en mt-2 text-xs text-stone/80">
          {view.next.type === "high" ? labels.nextHigh : labels.nextLow}{" "}
          <span className="tabular-nums">{timeFormat.format(new Date(view.next.time))}</span>
        </p>
      )}
      <p className="font-body-en mt-1 text-[0.6rem] leading-snug text-stone/50">{labels.source}</p>
    </div>
  );
}
