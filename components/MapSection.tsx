"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 50, y: 50 });
  const quickX = useRef<((value: number) => void) | null>(null);
  const quickY = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionEnabled(!mql.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setMotionEnabled(!event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!motionEnabled || !mapRef.current) return;
    const el = mapRef.current;
    quickX.current = gsap.quickTo(pos.current, "x", {
      duration: 0.5,
      ease: "power3",
      onUpdate: () => el.style.setProperty("--mx", `${pos.current.x}%`),
    });
    quickY.current = gsap.quickTo(pos.current, "y", {
      duration: 0.5,
      ease: "power3",
      onUpdate: () => el.style.setProperty("--my", `${pos.current.y}%`),
    });
  }, [motionEnabled]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!motionEnabled || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    quickX.current?.(xPercent);
    quickY.current?.(yPercent);
  };

  return (
    <section className="px-6 py-24 md:px-16 md:py-32">
      <h2 className="font-body-en mb-8 text-xs uppercase tracking-widest text-ink/50">
        {eyebrow}
      </h2>

      {/* TODO: 座標與地名為佔位資料，待確認實際地點後替換 content/locations.json */}
      <div
        ref={mapRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setRevealing(true)}
        onPointerLeave={() => setRevealing(false)}
        style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
        className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded border border-ink/10 bg-ink"
      >
        <svg
          viewBox="0 0 100 75"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0 55 C 15 45, 25 60, 40 50 C 55 40, 65 55, 80 45 C 90 40, 95 48, 100 42 L100 75 L0 75 Z"
            className="fill-stone/[0.08]"
          />
          <path
            d="M0 55 C 15 45, 25 60, 40 50 C 55 40, 65 55, 80 45 C 90 40, 95 48, 100 42"
            fill="none"
            className="stroke-stone/30"
            strokeWidth="0.5"
          />
        </svg>

        {/* 常駐的呼吸光點提示：純滑鼠 hover 的效果很容易完全沒人發現，
            這個提示使用者「這裡可以互動」，滑鼠移入聚光燈出現後就淡出 */}
        {motionEnabled && (
          <span
            aria-hidden="true"
            className={`animate-map-breathe pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-md transition-opacity duration-500 ${
              revealing ? "opacity-0" : "opacity-100"
            }`}
          />
        )}

        {/* 滑鼠遮罩顯現效果：跟隨游標的聚光燈，讓底下的海岸線變亮，純視覺氛圍、不承載額外資訊 */}
        {motionEnabled && (
          <svg
            viewBox="0 0 100 75"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
            style={{
              opacity: revealing ? 1 : 0,
              maskImage:
                "radial-gradient(120px 120px at var(--mx) var(--my), black, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(120px 120px at var(--mx) var(--my), black, transparent 70%)",
            }}
          >
            <path
              d="M0 55 C 15 45, 25 60, 40 50 C 55 40, 65 55, 80 45 C 90 40, 95 48, 100 42"
              fill="none"
              className="stroke-accent/90"
              strokeWidth="0.6"
            />
          </svg>
        )}

        {locations.map((location) => {
          const name = locale === "zh" ? location.name_zh : location.name_en;
          const isActive = activeId === location.id;
          return (
            <button
              key={location.id}
              type="button"
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none"
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
