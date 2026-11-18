"use client";

import { useEffect, useState } from "react";
import InteractiveHoverLinks from "@/components/ui/interactive-hover-links";
import type { Location } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";
import {
  LOCATION_TIDE_PLACE,
  TIDE_PLACES,
  formatSignedCm,
  tideNow,
  type TideExtreme,
  type TidePlace,
  type TideResponse,
} from "@/lib/tide";

// 目前只有馬岡有真實照片（跟 Hero 用的是同一張）；其他 3 個地點還沒有照片，
// 用 pendingLabel 標示，不會用假圖／示意圖頂替真實地點。
const LOCATION_PHOTOS: Record<string, { src: string; alt_zh: string; alt_en: string }> = {
  magang: { src: "/hero-magang.jpg", alt_zh: "貢寮・馬岡海岸", alt_en: "The coast at Magang, Gongliao" },
};

export type MapTideLabels = { rising: string; falling: string; source: string };

export default function MapSection({
  locale,
  locations,
  eyebrow,
  photoPendingLabel,
  viewOnMapLabel,
  tideLabels,
}: {
  locale: Locale;
  locations: Location[];
  eyebrow: string;
  photoPendingLabel: string;
  viewOnMapLabel: string;
  tideLabels: MapTideLabels;
}) {
  // 每個地點此刻的潮位：和平島、八斗子各有預報點，卯澳和馬岡共用貢寮區。
  // 同一個預報點只抓一次。拿不到資料的地點就不顯示潮位，不放假的數字。
  const [tides, setTides] = useState<Partial<Record<TidePlace, TideExtreme[]>>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (Object.keys(TIDE_PLACES) as TidePlace[]).forEach((place) => {
      fetch(`/api/tide?place=${place}`)
        .then((res) => (res.ok ? (res.json() as Promise<TideResponse>) : null))
        .then((data) => {
          if (!cancelled && data && data.extremes.length >= 2) {
            setTides((prev) => ({ ...prev, [place]: data.extremes }));
          }
        })
        .catch(() => {});
    });
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const hasAnyTide = Object.keys(tides).length > 0;

  return (
    <section className="px-6 py-24 md:px-16 md:py-32">
      <h2 className="font-body-en mb-8 text-xs uppercase tracking-widest text-ink/50">
        {eyebrow}
      </h2>

      <InteractiveHoverLinks
        className="mx-auto max-w-4xl"
        links={locations.map((location) => {
          const photo = LOCATION_PHOTOS[location.id];
          const place = LOCATION_TIDE_PLACE[location.id];
          const extremes = place ? tides[place] : undefined;
          return {
            id: location.id,
            heading: locale === "zh" ? location.name_zh : location.name_en,
            subheading: viewOnMapLabel,
            pendingLabel: photoPendingLabel,
            // 真實地名查詢，不是捏造座標——直接讓 Google 地圖自己解析地名。
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${location.name_en}, Taiwan`,
            )}`,
            image: photo
              ? { src: photo.src, alt: locale === "zh" ? photo.alt_zh : photo.alt_en }
              : undefined,
            meta: extremes ? <PlaceTide extremes={extremes} now={now} labels={tideLabels} /> : undefined,
          };
        })}
      />

      {hasAnyTide && (
        <p className="font-body-en mx-auto mt-6 max-w-4xl text-[0.7rem] leading-snug text-ink/45">
          {tideLabels.source}
        </p>
      )}
    </section>
  );
}

/**
 * 一條小水位條：左端是今天的最低潮、右端是今天的最高潮，水填到此刻的位置。
 * 跟首頁 Hero 的潮位卡用同一套推算（lib/tide.ts）。
 */
function PlaceTide({
  extremes,
  now,
  labels,
}: {
  extremes: TideExtreme[];
  now: number;
  labels: MapTideLabels;
}) {
  const tide = tideNow(extremes, now);
  if (!tide) return null;
  const span = Math.max(tide.todayHigh - tide.todayLow, 1);
  const fill = Math.min(1, Math.max(0, (tide.current - tide.todayLow) / span));

  return (
    <span className="font-body-en inline-flex items-center gap-3 text-xs text-ink/60">
      <span
        aria-hidden="true"
        className="relative inline-block h-1.5 w-16 overflow-hidden rounded-full bg-ink/10"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-ink/45 transition-[width] duration-1000"
          style={{ width: `${fill * 100}%` }}
        />
      </span>
      <span className="tabular-nums text-ink/80">{formatSignedCm(tide.current)} cm</span>
      <span>{tide.rising ? `↑ ${labels.rising}` : `↓ ${labels.falling}`}</span>
    </span>
  );
}
