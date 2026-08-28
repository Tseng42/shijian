"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export interface TextRevealProps {
  text: string;
  locale: Locale;
  /** Scroll distance the reveal plays out over. Default "200vh" — same runway
   * scroll-burn-text.tsx uses per block, so this reads at the same pace. */
  runway?: string;
  fontClassName?: string;
  className?: string;
}

/**
 * Second engine on this component: was Framer Motion's useScroll/useTransform,
 * rebuilt on GSAP+ScrollTrigger so every scroll-driven effect on the site
 * (Hero, Story, Craft, this) shares one engine, wired to the same Lenis
 * instance. Follows scroll-burn-text.tsx's own trick for the actual reveal:
 * one scroll progress value written to a single CSS custom property per
 * frame, and each unit resolves its own opacity from that via `calc()` —
 * one style write per scroll tick instead of one per character.
 *
 * Splits by character for zh and by word for en — `text.split(" ")` on zh
 * copy (no spaces) would reveal the whole paragraph as a single unit.
 */
function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  return reduce;
}

export default function TextReveal({
  text,
  locale,
  runway = "200vh",
  fontClassName,
  className,
}: TextRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const runwayRef = React.useRef<HTMLDivElement>(null);

  const units = React.useMemo(
    () => (locale === "zh" ? Array.from(text) : text.split(/\s+/).filter(Boolean)),
    [text, locale],
  );
  const spaced = locale !== "zh";
  const count = units.length;

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const el = runwayRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const update = (p: number) => {
      el.style.setProperty("--reveal-p", `${p}`);
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
    });
    update(st.progress);

    return () => {
      st.kill();
    };
  }, [prefersReducedMotion, count]);

  if (prefersReducedMotion) {
    return (
      <p className={cn("max-w-3xl text-ink", fontClassName, className)}>
        {text}
      </p>
    );
  }

  return (
    <div
      ref={runwayRef}
      className={cn("relative", className)}
      style={{ height: runway, "--reveal-p": 0 } as React.CSSProperties}
    >
      <div className="sticky top-0 flex h-screen max-w-3xl items-center px-1 py-20">
        <p
          className={cn(
            "flex flex-wrap text-xl font-bold leading-[1.7] md:text-2xl lg:text-3xl",
            fontClassName,
          )}
        >
          {units.map((unit, i) => {
            const start = i / count;
            return (
              <span key={i} className="contents">
                <span className={cn("relative", spaced && "mx-1 lg:mx-1.5")}>
                  <span aria-hidden="true" className="absolute text-ink/25">
                    {unit}
                  </span>
                  <span
                    className="text-ink"
                    style={{
                      opacity: `min(1, max(0, (var(--reveal-p) - ${start}) * ${count}))`,
                    }}
                  >
                    {unit}
                  </span>
                </span>
                {spaced ? " " : null}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
