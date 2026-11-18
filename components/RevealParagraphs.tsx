"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fixChineseTypography } from "@/lib/utils";

// 一段浪：寬 40、高 12 的 SVG 單位，重複兩倍寬，往左平移一半就能無縫循環。
const WAVE_PATH = (() => {
  let d = "M0 6";
  for (let x = 0; x < 400; x += 40) {
    d += ` Q${x + 10} 0 ${x + 20} 6 T${x + 40} 6`;
  }
  return `${d} V12 H0 Z`;
})();

/**
 * 退潮露出：段落進到畫面時，原本蓋在上面的一層海水帶著小浪往下退開，字才
 * 露出來——潮水退了，礁石才露出來，海女才能下去採集。每段只退一次（約 0.8 秒），
 * 退完就不再動，不打擾閱讀。
 *
 * 水層預設是 display:none，要等 JS 接手才蓋上去：JS 沒跑或開了減少動態效果
 * 的訪客，看到的就是一般的段落。
 */
export default function RevealParagraphs({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      containerRef.current!
        .querySelectorAll<HTMLElement>("[data-reveal-paragraph]")
        .forEach((el) => {
          const water = el.querySelector<HTMLElement>("[data-reveal-water]");
          if (!water) return;
          gsap.set(water, { display: "block", yPercent: 0 });

          gsap.to(water, {
            yPercent: 104,
            duration: 0.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            // 退完就整個拿掉，浪的循環動畫也跟著停。
            onComplete: () => {
              gsap.set(water, { display: "none" });
            },
          });
        });
    }, containerRef);

    return () => ctx.revert();
  }, [paragraphs]);

  return (
    <div ref={containerRef} className="space-y-6">
      {paragraphs.map((paragraph, index) => (
        <div key={index} data-reveal-paragraph className="relative overflow-hidden">
          <p className={className}>{fixChineseTypography(paragraph)}</p>
          <div
            data-reveal-water
            aria-hidden="true"
            className="tide-water pointer-events-none absolute inset-0 hidden"
          >
            {/* 水面：浪頭在水層的上緣，跟著水層一起往下退。 */}
            <svg
              viewBox="0 0 400 12"
              preserveAspectRatio="none"
              className="animate-tide-wave absolute bottom-full left-0 h-3 w-[200%]"
            >
              <path d={WAVE_PATH} className="tide-water-wave" />
              <path
                d={WAVE_PATH.replace(/ V12 H0 Z$/, "")}
                fill="none"
                className="stroke-ink/25"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
