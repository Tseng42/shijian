"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CraftContent } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

export default function Craft({
  locale,
  content,
}: {
  locale: Locale;
  content: CraftContent;
}) {
  const sectionRef = useRef<HTMLElement>(null);
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-24 md:px-16 md:py-32">
      <p className="font-body-en mb-3 text-xs uppercase tracking-widest text-ink/50">
        Craft
      </p>
      <h2 className={`${headingFont} mb-4 text-2xl font-bold md:text-3xl`}>
        {title}
      </h2>
      <p className={`${bodyFont} mb-16 max-w-xl text-ink/70`}>{intro}</p>

      <ol className="mx-auto flex max-w-3xl flex-col gap-16">
        {content.steps.map((step, index) => {
          const label = locale === "zh" ? step.label_zh : step.label_en;
          const text = locale === "zh" ? step.text_zh : step.text_en;
          return (
            <li key={step.key} data-craft-step className="flex gap-6">
              <span className="font-heading-en text-sm text-accent">
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
    </section>
  );
}
