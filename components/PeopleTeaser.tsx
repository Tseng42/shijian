"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PersonCard from "@/components/PersonCard";
import type { Person } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/config";

type PeopleTeaserProps = {
  locale: Locale;
  people: Person[];
  eyebrow: string;
  viewAllLabel: string;
  pendingLabel: string;
};

export default function PeopleTeaser({
  locale,
  people,
  eyebrow,
  viewAllLabel,
  pendingLabel,
}: PeopleTeaserProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current)
      return;

    gsap.registerPlugin(ScrollTrigger);

    // 等中文字體就緒、版面高度穩定後再建立 pin，避免用 fallback 字體量出的
    // 過期高度算出錯誤的 pin 起訖位置（會造成捲動時跳位，見 SmoothScroll 的說明）。
    let ctx: gsap.Context | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !sectionRef.current || !trackRef.current) return;

      ctx = gsap.context(() => {
        const track = trackRef.current!;
        const scrollDistance = track.scrollWidth - window.innerWidth;
        if (scrollDistance <= 0) return;

        // 捲動越快、整排卡片越往捲動方向輕輕傾斜，停下來就回正——
        // 用 quickTo 讓每次取樣之間有緩衝，不會每幀硬切造成抖動。
        const skewTo = gsap.quickTo(track, "skewX", {
          duration: 0.4,
          ease: "power3",
        });

        gsap.to(track, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
            // 卡片景深：離目前捲動進度越遠的卡片，微微轉向越多，純數學算法，
            // 不讀版面尺寸（避免每個 tick 都觸發 layout reflow）。
            onUpdate: (self) => {
              const cards = track.children;
              const count = cards.length;
              if (count <= 1) return;
              for (let i = 0; i < count; i++) {
                const cardProgress = i / (count - 1);
                const deviation = self.progress - cardProgress;
                const rotateY = gsap.utils.clamp(-12, 12, deviation * -40);
                gsap.set(cards[i], { rotateY });
              }
              skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / -300));
            },
            onLeave: () => skewTo(0),
            onLeaveBack: () => skewTo(0),
          },
        });
      }, sectionRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [people.length]);

  return (
    <section ref={sectionRef} className="overflow-hidden bg-ink py-24 text-stone">
      <div className="mb-10 px-6 md:px-16">
        <h2 className="font-body-en text-xs uppercase tracking-widest text-stone/50">
          {eyebrow}
        </h2>
      </div>

      <div
        ref={trackRef}
        style={{ perspective: "1000px" }}
        className="flex gap-6 px-6 motion-reduce:flex-wrap motion-reduce:overflow-x-auto md:px-16"
      >
        {people.map((person) => (
          <PersonCard
            key={person.slug}
            person={person}
            locale={locale}
            pendingLabel={pendingLabel}
            variant="onDark"
            className="w-64 shrink-0 md:w-80"
          />
        ))}
      </div>

      <div className="mt-10 px-6 md:px-16">
        <Link
          href={`/${locale}/people`}
          className="font-body-en -ml-1 inline-flex min-h-11 items-center px-1 text-sm underline decoration-stone/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {viewAllLabel}
        </Link>
      </div>
    </section>
  );
}
