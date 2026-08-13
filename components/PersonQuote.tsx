"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export default function PersonQuote({
  quote,
  className,
}: {
  quote: string;
  className: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !ref.current) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // 等字體就緒後再拆行，避免用 fallback 字體量出錯誤的行寬（同 Story 區塊的處理方式）。
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      ctx = gsap.context(() => {
        const split = new SplitText(ref.current, {
          type: "lines",
          linesClass: "quote-line",
        });
        gsap.set(split.lines, { opacity: 0, y: 20 });

        gsap.to(split.lines, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {quote}
    </p>
  );
}
