"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

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

    gsap.registerPlugin(ScrollTrigger, SplitText);

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // 同 Story／PersonQuote：等字體就緒後再拆行，避免 fallback 字體量出錯誤行寬。
    document.fonts.ready.then(() => {
      if (cancelled || !containerRef.current) return;

      ctx = gsap.context(() => {
        const paragraphEls =
          containerRef.current!.querySelectorAll<HTMLElement>(
            "[data-reveal-paragraph]"
          );

        paragraphEls.forEach((el) => {
          const split = new SplitText(el, {
            type: "lines",
            linesClass: "reveal-line",
          });
          gsap.set(split.lines, { opacity: 0, y: 20 });

          gsap.to(split.lines, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      }, containerRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [paragraphs]);

  return (
    <div ref={containerRef} className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} data-reveal-paragraph className={className}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
