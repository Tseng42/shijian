"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CraftContent } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

export default function Craft({
  locale,
  content,
  eyebrow,
  experienceCta,
}: {
  locale: Locale;
  content: CraftContent;
  eyebrow: string;
  experienceCta: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const title = locale === "zh" ? content.title_zh : content.title_en;
  const intro = locale === "zh" ? content.intro_zh : content.intro_en;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const steps =
        sectionRef.current!.querySelectorAll<HTMLElement>("[data-craft-step]");

      steps.forEach((step) => {
        gsap.set(step, { opacity: 0, y: 32 });
        gsap.to(step, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      });

      if (lineRef.current && listRef.current) {
        const numbers = listRef.current.querySelectorAll<HTMLElement>(
          "[data-craft-number]"
        );

        gsap.set(lineRef.current, { scaleY: 0 });
        gsap.to(lineRef.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.6,
            // 掃描線效果：線掃到哪一步，那一步的編號就從暗轉亮的 accent 色
            onUpdate: (self) => {
              const litIndex = Math.floor(self.progress * numbers.length);
              numbers.forEach((el, i) => {
                el.classList.toggle("text-accent", i <= litIndex);
                el.classList.toggle("text-ink/25", i > litIndex);
              });
            },
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-32 md:px-[10%] md:py-48">
      <p className="font-body-en mb-4 text-xs uppercase tracking-[0.3em] text-ink/50">
        {eyebrow}
      </p>
      <h2
        className={`${headingFont} mb-6 max-w-3xl text-balance text-4xl font-bold leading-[1.15] md:mb-8 md:text-6xl`}
      >
        {title}
      </h2>
      <p className={`${bodyFont} mb-24 max-w-xl text-ink/70 md:mb-32`}>{intro}</p>

      <div ref={listRef} className="relative mx-auto max-w-3xl">
        <div
          aria-hidden="true"
          className="absolute bottom-2 left-4 top-2 w-px bg-ink/10"
        />
        <div
          ref={lineRef}
          aria-hidden="true"
          className="absolute bottom-2 left-4 top-2 w-px origin-top bg-accent"
        />
        <ol className="flex flex-col gap-16">
          {content.steps.map((step, index) => {
            const label = locale === "zh" ? step.label_zh : step.label_en;
            const text = locale === "zh" ? step.text_zh : step.text_en;
            return (
              <li key={step.key} data-craft-step className="flex gap-6">
                <span
                  data-craft-number
                  className="w-8 font-heading-en text-sm text-ink/25 transition-colors duration-300"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={`${headingFont} mb-2 text-xl font-bold`}>
                    {label}
                  </h3>
                  <p className={`${bodyFont} text-ink/70`}>{text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Link
        href={`/${locale}/experience`}
        className="font-body-en -ml-1 mt-16 inline-flex min-h-11 items-center px-1 text-sm underline decoration-ink/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
      >
        {experienceCta}
      </Link>
    </section>
  );
}
