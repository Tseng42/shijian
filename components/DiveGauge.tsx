"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 石花菜生長在礁岩低潮線到水深約 5 公尺的礁石上（新北市政府資料，
// 中央社 2025-04-06 報導引用）。深度計的刻度就到這裡為止，不誇大成深潛。
const MAX_DEPTH_M = 5;

/**
 * 下水：採集技藝「採集」那一頁右側的一條水柱。這一頁停在畫面上的時候，
 * 捲動就是往下潛——游標從水面沉到 5 公尺，水面透下來的光一起變淡。
 * 刻意只做一條窄窄的水柱，不把整頁背景變暗：內文是深色字，整頁變暗就讀不到了。
 */
export default function DiveGauge({ depthLabel }: { depthLabel: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const mobileReadoutRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const onChange = () => setReduceMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const marker = markerRef.current;
    const readout = readoutRef.current;
    const mobileReadout = mobileReadoutRef.current;
    const light = lightRef.current;
    if (!root || !marker || !readout || !mobileReadout || !light) return;

    const paint = (p: number) => {
      marker.style.top = `${p * 100}%`;
      light.style.opacity = `${1 - p * 0.9}`;
      const text = `−${(p * MAX_DEPTH_M).toFixed(1)} m`;
      readout.textContent = text;
      mobileReadout.textContent = text;
    };

    if (reduceMotion) {
      paint(1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    // 這一頁轉正、pin 住之後才開始下潛，潛的距離就是 FlowSection 的停留
    // （holdScreens）——潛到 5 公尺剛好停留結束，下一頁才轉進來。
    const section = root.closest<HTMLElement>("[data-flow-section]") ?? root;
    const hold = Number(section.dataset.flowHold ?? 0);
    const inner = section.querySelector<HTMLElement>("[data-flow-inner]") ?? section;
    const st = ScrollTrigger.create({
      trigger: section,
      // 跟 FlowArt 的 pin 起點一致：內容的底碰到畫面底，這一頁才算停好。
      start:
        hold > 0
          ? () => `top+=${Math.max(0, inner.offsetHeight - window.innerHeight)} top`
          : "top 40%",
      end: hold > 0 ? () => `+=${window.innerHeight * hold}` : "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => paint(self.progress),
      onRefresh: (self) => paint(self.progress),
    });
    paint(st.progress);
    return () => st.kill();
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-24 right-4 top-24 w-9 md:right-[6%] md:w-16"
    >
      <p className="font-body-en absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.22em] text-ink/50">
        {depthLabel}
      </p>

      {/* 水柱：上淺下深，跟真實的水色一樣越深越暗。 */}
      <div className="absolute inset-0 overflow-hidden rounded-full border border-ink/10 bg-gradient-to-b from-ink/5 via-ink/35 to-ink/90">
        <div
          ref={lightRef}
          className="animate-dive-light absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "repeating-linear-gradient(100deg, rgba(240,243,242,0.55) 0 2px, rgba(240,243,242,0) 2px 9px)",
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>

      {/* 刻度：0 到 5 公尺，每公尺一格。 */}
      {Array.from({ length: MAX_DEPTH_M + 1 }, (_, m) => (
        <span
          key={m}
          className="absolute -left-2 h-px w-1.5 bg-ink/30"
          style={{ top: `${(m / MAX_DEPTH_M) * 100}%` }}
        />
      ))}

      <div ref={markerRef} className="absolute inset-x-0" style={{ top: 0 }}>
        <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(224,86,43,0.25)]" />
        {/* 吐出的氣泡往上浮。 */}
        <span className="animate-dive-bubble absolute left-1/2 h-1 w-1 -translate-y-3 rounded-full border border-stone/80" />
        <span className="animate-dive-bubble absolute left-[40%] h-1.5 w-1.5 -translate-y-3 rounded-full border border-stone/70 [animation-delay:1.1s]" />
        <span
          ref={readoutRef}
          className="font-body-en absolute right-full top-0 mr-4 hidden -translate-y-1/2 whitespace-nowrap text-xs tabular-nums text-ink/70 md:block"
        >
          −0.0 m
        </span>
      </div>

      {/* 手機上跟著游標走的數字會壓到內文，改成固定在水柱底下。 */}
      <span
        ref={mobileReadoutRef}
        className="font-body-en absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] tabular-nums text-ink/70 md:hidden"
      >
        −0.0 m
      </span>
    </div>
  );
}
