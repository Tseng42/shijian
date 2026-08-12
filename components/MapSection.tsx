"use client";

import { useState } from "react";
import type { Location } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

export default function MapSection({
  locale,
  locations,
  eyebrow,
}: {
  locale: Locale;
  locations: Location[];
  eyebrow: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="px-6 py-24 md:px-16 md:py-32">
      <p className="font-body-en mb-8 text-xs uppercase tracking-widest text-ink/50">
        {eyebrow}
      </p>

      {/* TODO: 座標與地名為佔位資料，待確認實際地點後替換 content/locations.json */}
      <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded border border-ink/10 bg-ink">
        <svg
          viewBox="0 0 100 75"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0 55 C 15 45, 25 60, 40 50 C 55 40, 65 55, 80 45 C 90 40, 95 48, 100 42 L100 75 L0 75 Z"
            fill="#F4F0E6"
            fillOpacity="0.08"
          />
          <path
            d="M0 55 C 15 45, 25 60, 40 50 C 55 40, 65 55, 80 45 C 90 40, 95 48, 100 42"
            fill="none"
            stroke="#F4F0E6"
            strokeOpacity="0.3"
            strokeWidth="0.5"
          />
        </svg>

        {locations.map((location) => {
          const name = locale === "zh" ? location.name_zh : location.name_en;
          const isActive = activeId === location.id;
          return (
            <button
              key={location.id}
              type="button"
              className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onMouseEnter={() => setActiveId(location.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(location.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="block h-3 w-3 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-stone" />
              <span
                className={`font-body-en pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap bg-stone px-2 py-1 text-xs text-ink transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
