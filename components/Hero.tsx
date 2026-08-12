"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero({ scrollHint }: { scrollHint: string }) {
  const [motionEnabled, setMotionEnabled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionEnabled(!mql.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setMotionEnabled(!event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!motionEnabled || !sectionRef.current || !frameRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(frameRef.current, {
        scale: 0.62,
        clipPath: "inset(9% 14% round 28px)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 0.6,
        },
      });

      tl.to(
        frameRef.current,
        { scale: 1, clipPath: "inset(0% 0% round 0px)", ease: "none" },
        0
      ).to(titleRef.current, { opacity: 0, y: -32, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, [motionEnabled]);

  return (
    <section
      ref={sectionRef}
      className={motionEnabled ? "relative h-[200vh]" : "relative h-screen"}
    >
      <div
        className={
          motionEnabled
            ? "sticky top-0 h-screen w-full overflow-hidden bg-ink"
            : "h-screen w-full overflow-hidden bg-ink"
        }
      >
        <div ref={frameRef} className="absolute inset-0 h-full w-full">
          {motionEnabled ? (
            // TODO: 影片素材待補，正式檔案請放在 /public/placeholder-hero.mp4
            <video
              className="h-full w-full object-cover"
              src="/placeholder-hero.mp4"
              poster="/placeholder-hero-poster.svg"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          ) : (
            // TODO: 靜態圖片素材待補，正式檔案請放在 /public/placeholder-hero-poster.jpg
            <Image
              src="/placeholder-hero-poster.svg"
              alt="" // TODO: 補充有意義的 alt 文字
              fill
              priority
              className="object-cover"
            />
          )}
        </div>

        <div
          ref={titleRef}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center ${
            !motionEnabled ? "animate-hero-fade-in" : ""
          }`}
        >
          {/* TODO: 替換為正式 Logo SVG，檔案將命名為 /public/logo.svg，單色墨色版本 */}
          <h1 className="font-heading-zh text-5xl font-black text-stone md:text-8xl">
            拾間
            <span className="font-heading-en mt-2 block text-2xl font-normal italic text-stone/90 md:text-4xl">
              ShiJian
            </span>
          </h1>
          <p className="font-body-en text-xs uppercase tracking-[0.3em] text-stone/70">
            {scrollHint}
          </p>
        </div>
      </div>
    </section>
  );
}
