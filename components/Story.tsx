"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollBurnText from "@/components/ui/scroll-burn-text";
import type { Locale } from "@/lib/i18n/config";

type StoryProps = {
  locale: Locale;
  title: string;
  paragraphs: string[];
};

export default function Story({ locale, title, paragraphs }: StoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 背景一直有一顆極慢的天青色潮汐光暈在呼吸，滑鼠移進來時光暈會懶懶地
    // 跟過去——呼應「以身體與潮汐對話」這句話本身，而不是純裝飾。放在燒字
    // 效果的 backdrop 裡，才會跟著 pin 住的畫面一起固定，不會跟捲動脫節。
    if (!glowRef.current) return;

    if (prefersReducedMotion) {
      gsap.set(glowRef.current, { opacity: 0.5, scale: 1 });
      return;
    }

    gsap.to(glowRef.current, {
      scale: 1.18,
      opacity: 0.75,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const section = sectionRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || !section) return;

    const quickX = gsap.quickTo(glowRef.current, "x", { duration: 1.4, ease: "power2" });
    const quickY = gsap.quickTo(glowRef.current, "y", { duration: 1.4, ease: "power2" });
    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      quickX(relX * 60);
      quickY(relY * 40);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    // 沒有 overflow-hidden：這個 class 放在這裡會讓下面 ScrollBurnText 的
    // sticky 畫面失效（position: sticky 是跟「最近一個 overflow 不是 visible
    // 的祖先」對齊，一旦這層本身變成那個祖先，畫面就只會跟著頁面正常捲走，
    // 不會真的固定）。光暈本身已經被 ScrollBurnText 自己的 sticky 容器裁切，
    // 這層不需要再裁一次。
    <section ref={sectionRef} className="relative bg-stone">
      <div className="px-6 pt-32 md:px-[10%] md:pt-40">
        <h2 className="font-body-en text-xs uppercase tracking-[0.3em] text-ink/50">
          {title}
        </h2>
      </div>

      <ScrollBurnText
        sections={paragraphs}
        hint={null}
        runway="200vh"
        fontClassName={headingFont}
        className="bg-transparent"
        backdrop={
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(62,100,114,0.4) 0%, rgba(62,100,114,0.1) 46%, rgba(62,100,114,0) 72%)",
            }}
          />
        }
      />
    </section>
  );
}
