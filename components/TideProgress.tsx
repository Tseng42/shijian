"use client";

import { useEffect, useRef, useState } from "react";
import { TIDE_COLORS } from "@/lib/soak-dry-colors";

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
