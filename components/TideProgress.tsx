"use client";

import { useEffect, useRef, useState } from "react";

// 七泡七曬：石花菜從深紫褐曬到亮麗米白的七個真實色階（取自 craft.json／
// ecology.json 記錄的顏色變化），是全站唯一直接借用這道台灣特有工序本身、
// 而非通用特效樣板的視覺訊號。捲動進度條依序帶過這七色，等於讓訪客
// 「捲」過一次石花菜曬乾的過程。刻意不當作全站底色使用——七泡七曬的顏色
// 只留在這條細細的進度條上，不動檔案白本身的識別。
const TIDE_COLORS = [
  "#4A2E28", // 深紫／深褐
  "#7A3F2E", // 棕紅
  "#A66B3E", // 淺咖啡／黃褐
  "#C79447", // 土黃
  "#DDB662", // 鵝黃／淡奶油
  "#EAD08C", // 米黃
  "#F5EDD6", // 亮麗米白
];

export default function TideProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const onChange = () => setReduceMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      const stepIndex = Math.min(
        TIDE_COLORS.length - 1,
        Math.floor(clamped * TIDE_COLORS.length)
      );
      bar.style.width = `${clamped * 100}%`;
      bar.style.backgroundColor = TIDE_COLORS[stepIndex];
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 h-[3px] w-full bg-ink/5"
    >
      <div
        ref={barRef}
        className={`h-full w-0 ${reduceMotion ? "" : "transition-colors duration-500 ease-out"}`}
      />
    </div>
  );
}
