"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Adapted from a 21st.dev community recipe ("story-scroll" / FlowArt): each
// full-viewport section pins in place while the next one rotates up from 30°
// to flat and slides over it. The original drove this through @gsap/react's
// useGSAP hook, which isn't installed here and nowhere else in this codebase
// reaches for it — every other GSAP component in this project (Hero, Story,
// Craft) wires gsap.context() into a plain useEffect, so this is rebuilt on
// that same convention instead of adding a second lifecycle pattern.

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  "aria-label"?: string;
  /**
   * 這一頁轉正之後，下一頁進來之前要多停幾個螢幕高度的捲動距離。給頁內還有
   * 自己的捲動動畫要跑完的那一頁用（例如採集頁的下潛深度計）。
   */
  holdScreens?: number;
}

export function FlowSection({
  className,
  style = {},
  children,
  "aria-label": ariaLabel,
  holdScreens = 0,
}: FlowSectionProps) {
  return (
    <>
      {/* className（背景色／文字色）放在會轉動的 inner div 上，不是這層——
          放這層的話，色塊在轉動動畫開始前就已經整片鋪滿、完全靜止不動，
          只有裡面的文字在轉，看起來就是「文字轉進來，色塊早就在那了」。 */}
      <section
        data-flow-section
        data-flow-hold={holdScreens || undefined}
        aria-label={ariaLabel}
        className="relative min-h-screen w-full overflow-hidden"
      >
        <div
          data-flow-inner
          className={cn(
            "flow-inner relative flex min-h-screen w-full flex-col justify-center gap-6 px-6 py-24 will-change-transform md:px-[10%]",
            className,
          )}
          style={{ transformOrigin: "bottom left", ...style }}
        >
          {children}
        </div>
        {holdScreens > 0 && (
          // 停留用的透明空白，放在這一頁「裡面」、內容下方：整頁 pin 住時這段
          // 不會動，下一頁要等捲過這段才排到畫面底部、開始轉進來，看起來就是
          // 「停住」。（放在這一頁外面當兄弟元素試過，後面幾頁 pin 的起點會算錯，
          // 泡曬蓋上來之後採集頁又跑回來。）減少動態時沒有 pin，空白一起收掉。
          <div
            aria-hidden="true"
            className="motion-reduce:!h-0"
            style={{ height: `${holdScreens * 100}vh` }}
          />
        )}
      </section>
    </>
  );
}

export interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export default function FlowArt({
  children,
  className,
  "aria-label": ariaLabel = "Scroll sequence",
}: FlowArtProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const sections = Array.from(
        containerRef.current!.querySelectorAll<HTMLElement>("[data-flow-section]")
      );
      if (sections.length === 0) return;

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });
        const inner = section.querySelector<HTMLElement>(".flow-inner");
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: "bottom left" });
          gsap.to(inner, {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
            },
          });
        }

        if (i < sections.length - 1) {
          // 有設停留的那頁，pin 要多撐過後面那段停留空白，下一頁才蓋上來。
          // 停留的空白在這一頁裡面，所以起點改成「內容的底碰到畫面底」，
          // 不是整個 section 的底；撐的長度是停留＋下一頁蓋上來的一個螢幕。
          const hold = Number(section.dataset.flowHold ?? 0);
          ScrollTrigger.create({
            trigger: section,
            start:
              hold > 0
                ? () => `top+=${Math.max(0, inner.offsetHeight - window.innerHeight)} top`
                : "bottom bottom",
            end: hold > 0 ? () => `+=${window.innerHeight * (1 + hold)}` : "bottom top",
            invalidateOnRefresh: hold > 0,
            pin: true,
            pinSpacing: false,
          });
        }
      });

      // 不在這裡自己呼叫 ScrollTrigger.refresh()：這是全域函式，會在其他區塊
      // （Hero、Story 等）可能還沒掛載完成時就重算全頁位置，反而算錯。
      // SmoothScroll.tsx 已經在字體就緒／整頁載入完成後做過一次全域 refresh，
      // 跟站上其他捲動效果共用同一個時機，不要在這裡重複一次搶時間點。
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, children]);

  return (
    <div ref={containerRef} aria-label={ariaLabel} className={cn("w-full overflow-x-hidden", className)}>
      {children}
    </div>
  );
}
