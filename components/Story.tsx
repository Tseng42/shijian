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
  const leadRef = useRef<HTMLParagraphElement>(null);
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";
  const [lead, ...rest] = paragraphs;

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
        // 大字主敘事句：逐行從遮罩下方浮出，是這個段落唯一的「重手法」，
        // 其餘段落維持原本輕量的淡入，才不會整段都在動、失去重點。
        if (leadRef.current) {
          // 註：曾嘗試用 wordDelimiter:"" 讓中文逐行偵測更準確，但實測會不穩定
          // （同一段文字有時正確抓到 4 行，有時整句被拆成一字一行），
          // 風險是正式環境可能出現破版，改回穩定但沒有逐行分段的整段遮罩淡入。
          const leadSplit = new SplitText(leadRef.current, {
            type: "lines",
            mask: "lines",
            linesClass: "story-lead-line",
          });
          gsap.set(leadSplit.lines, { yPercent: 110 });
          gsap.to(leadSplit.lines, {
            yPercent: 0,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: leadRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        }

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
  }, [lead, rest.length]);

  return (
    <section ref={sectionRef} className="px-6 py-32 md:px-[10%] md:py-48">
      <h2 className="font-body-en mb-10 text-xs uppercase tracking-[0.3em] text-ink/50 md:mb-16">
        {title}
      </h2>
      <p
        ref={leadRef}
        className={`${headingFont} mb-16 max-w-4xl text-4xl font-bold leading-[1.15] md:mb-24 md:text-6xl lg:text-7xl`}
      >
        {lead}
      </p>
      <div className="max-w-xl space-y-8 md:ml-auto">
        {rest.map((paragraph, index) => (
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
