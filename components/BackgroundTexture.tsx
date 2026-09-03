"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// 全站固定背景：淡灰點陣（檔案紙感），游標移動時附近的點會被浮標橘暈染蓋過去。
// 只做背景本身的互動，不碰文字——文字維持一般排版。
// （色碼對應 tailwind.config.ts 的 ink/accent token，跟著色票走——這層之前
// 已經因為色票換了兩輪、忘記跟著改而寫死過舊色，全站每頁都在跑，特別顯眼，
// 這次改色票時一起處理，不要再漏掉。）
export default function BackgroundTexture() {
  const [interactive, setInteractive] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 50, y: 50 });
  const quickX = useRef<((value: number) => void) | null>(null);
  const quickY = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointer = window.matchMedia("(pointer: fine)");
    const update = () => setInteractive(!reduceMotion.matches && finePointer.matches);
    update();
    reduceMotion.addEventListener("change", update);
    finePointer.addEventListener("change", update);
    return () => {
      reduceMotion.removeEventListener("change", update);
      finePointer.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!interactive || !layerRef.current) return;
    const el = layerRef.current;

    quickX.current = gsap.quickTo(pos.current, "x", {
      duration: 0.6,
      ease: "power3",
      onUpdate: () => el.style.setProperty("--mx", `${pos.current.x}%`),
    });
    quickY.current = gsap.quickTo(pos.current, "y", {
      duration: 0.6,
      ease: "power3",
      onUpdate: () => el.style.setProperty("--my", `${pos.current.y}%`),
    });

    const handlePointerMove = (event: PointerEvent) => {
      if (!window.innerWidth || !window.innerHeight) return;
      quickX.current?.((event.clientX / window.innerWidth) * 100);
      quickY.current?.((event.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [interactive]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(rgba(15,22,32,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {interactive && (
        <div
          ref={layerRef}
          style={
            {
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(224,86,43,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              "--mx": "50%",
              "--my": "50%",
              maskImage:
                "radial-gradient(140px 140px at var(--mx) var(--my), black, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(140px 140px at var(--mx) var(--my), black, transparent 70%)",
            } as React.CSSProperties
          }
        />
      )}
    </div>
  );
}
