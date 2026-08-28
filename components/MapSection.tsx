"use client";

import InteractiveHoverLinks from "@/components/ui/interactive-hover-links";
import type { Location } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

// 目前只有馬岡有真實照片（跟 Hero 用的是同一張）；其他 3 個地點還沒有照片，
// 用 pendingLabel 標示，不會用假圖／示意圖頂替真實地點。
const LOCATION_PHOTOS: Record<string, { src: string; alt_zh: string; alt_en: string }> = {
  magang: { src: "/hero-magang.jpg", alt_zh: "貢寮・馬岡海岸", alt_en: "The coast at Magang, Gongliao" },
};

export default function MapSection({
  locale,
  locations,
  eyebrow,
  photoPendingLabel,
  viewOnMapLabel,
}: {
  locale: Locale;
  locations: Location[];
  eyebrow: string;
  photoPendingLabel: string;
  viewOnMapLabel: string;
}) {
  return (
    <section className="px-6 py-24 md:px-16 md:py-32">
      <h2 className="font-body-en mb-8 text-xs uppercase tracking-widest text-ink/50">
        {eyebrow}
      </h2>

      <InteractiveHoverLinks
        className="mx-auto max-w-4xl"
        links={locations.map((location) => {
          const photo = LOCATION_PHOTOS[location.id];
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
          };
        })}
      />
    </section>
  );
}
