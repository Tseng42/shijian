"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Locale } from "@/lib/i18n/config";

type StoryProps = {
  locale: Locale;
  title: string;
  paragraphs: string[];
};

export default function Story({ locale, title, paragraphs }: StoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    // 等中文字體就緒後再拆行，避免用 fallback 字體量出錯誤的行寬／段落高度
    // （連帶會讓下方 People 區塊的 pin 位置算錯，造成捲動跳位）。
    let ctx: gsap.Context | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !sectionRef.current) return;

      ctx = gsap.context(() => {
        const paragraphEls =
          sectionRef.current!.querySelectorAll<HTMLElement>(
            "[data-story-paragraph]"
          );

        paragraphEls.forEach((el) => {
          const split = new SplitText(el, {
            type: "lines",
            linesClass: "story-line",
          });
          gsap.set(split.lines, { opacity: 0, y: 24 });

          gsap.to(split.lines, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        });
      }, sectionRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-24 md:px-[15%] md:py-40">
      <h2 className={`${headingFont} mb-10 text-2xl font-bold md:text-3xl`}>
        {title}
      </h2>
      <div className="space-y-8">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            data-story-paragraph
            className={`${bodyFont} text-lg leading-loose md:text-xl`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
