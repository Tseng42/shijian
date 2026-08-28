"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ImgStack, { type ImgStackRef } from "@/components/ui/img-stack";
import type { CarouselItem } from "@/components/ui/box-carousel";
import type { Person } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/config";
import { useSound } from "./SoundProvider";
import { playHoverTick } from "@/lib/sound";
import { usePressFeedback } from "@/lib/hooks/use-press-feedback";

type PeopleTeaserProps = {
  locale: Locale;
  people: Person[];
  eyebrow: string;
  viewAllLabel: string;
  pendingLabel: string;
  prevLabel: string;
  nextLabel: string;
  carouselLabel: string;
  carouselInstructions: string;
};

// 維持跟人物照片一致的 3:4 直式比例，尺寸隨螢幕寬度分級放大。
function getCarouselSize(width: number) {
  if (width < 640) return { width: 260, height: 347 };
  if (width < 1024) return { width: 380, height: 507 };
  return { width: 460, height: 613 };
}

export default function PeopleTeaser({
  locale,
  people,
  eyebrow,
  viewAllLabel,
  pendingLabel,
  prevLabel,
  nextLabel,
  carouselLabel,
  carouselInstructions,
}: PeopleTeaserProps) {
  const { enabled: soundEnabled } = useSound();
  const carouselRef = useRef<ImgStackRef>(null);
  const [size, setSize] = useState(() => getCarouselSize(0));
  const prevPress = usePressFeedback();
  const nextPress = usePressFeedback();

  useEffect(() => {
    const update = () => setSize(getCarouselSize(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 這裡沒有帶 linkUrl：堆疊卡片本身用點擊/拖曳來換下一張，不做點圖跳轉——
  // 兩種手勢搶同一次點擊會衝突。要看特定人物的完整頁面，走下面的「查看全部」。
  const items: CarouselItem[] = people.map((person) => {
    const name = locale === "zh" ? person.name_zh : person.name_en;
    return {
      id: person.slug,
      type: "image",
      src: person.photo,
      alt: name,
      caption: name,
      badge: person.status === "pending" ? pendingLabel : undefined,
    };
  });

  return (
    <section className="overflow-hidden bg-ink py-24 text-stone">
      <div className="mb-10 px-6 md:px-16">
        <h2 className="font-body-en text-xs uppercase tracking-widest text-stone/50">
          {eyebrow}
        </h2>
      </div>

      <div className="flex flex-col items-center gap-6">
        {size.width > 0 && (
          <ImgStack
            ref={carouselRef}
            items={items}
            width={size.width}
            height={size.height}
            variant="onDark"
            ariaLabel={carouselLabel}
            instructions={carouselInstructions}
            onIndexChange={() => soundEnabled && playHoverTick()}
          />
        )}

        <p aria-hidden="true" className="font-body-en text-[11px] uppercase tracking-wide text-stone/40">
          {carouselInstructions}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => carouselRef.current?.prev()}
            {...prevPress.handlers}
            aria-label={prevLabel}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-[color,border-color,border-width,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-stone/40 hover:text-stone active:scale-[0.94] active:border-2 active:border-stone active:text-stone ${
              prevPress.pressed
                ? "scale-[0.94] border-2 border-stone text-stone"
                : "border-stone/20 text-stone/70"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => carouselRef.current?.next()}
            {...nextPress.handlers}
            aria-label={nextLabel}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-[color,border-color,border-width,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-stone/40 hover:text-stone active:scale-[0.94] active:border-2 active:border-stone active:text-stone ${
              nextPress.pressed
                ? "scale-[0.94] border-2 border-stone text-stone"
                : "border-stone/20 text-stone/70"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
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
