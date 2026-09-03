"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaterRippleImage from "@/components/ui/water-ripple-image";
import { usePressFeedback } from "@/lib/hooks/use-press-feedback";

// 顆粒疊層：4x4 的 feTurbulence 雜訊磚，用 background-repeat 貼滿畫面。
// 這是唯一給「持續有生命感」用的裝飾層，跟捲動、滑鼠都無關，隨時在動一點點。
const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function Hero({
  scrollHint,
  pauseMotionLabel,
  playMotionLabel,
}: {
  scrollHint: string;
  pauseMotionLabel: string;
  playMotionLabel: string;
}) {
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [wavesPlaying, setWavesPlaying] = useState(true);
  const { pressed: mutePressed, handlers: mutePressHandlers } = usePressFeedback();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  const toggleWaves = () => setWavesPlaying((prev) => !prev);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionEnabled(!mql.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setMotionEnabled(!event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // 環境動態：滑鼠移動時整個潮線畫面跟著做極輕微的視差傾斜，
  // 只在有精準指標（滑鼠）的裝置上啟用，觸控裝置不需要這個。
  useEffect(() => {
    if (!motionEnabled || !parallaxRef.current) return;
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const el = parallaxRef.current;
    const quickX = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" });
    const quickY = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" });
    const quickRotate = gsap.quickTo(el, "rotate", { duration: 0.9, ease: "power3" });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      quickX(relX * 24);
      quickY(relY * 14);
      quickRotate(relX * 1.2);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [motionEnabled]);

  // 顆粒紋理：不隨捲動，只是持續極輕微地飄移，讓畫面在靜止時也不是死的。
  useEffect(() => {
    if (!motionEnabled || !grainRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(grainRef.current, {
        backgroundPosition: "120px 90px",
        duration: 9,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    });
    return () => ctx.revert();
  }, [motionEnabled]);

  useEffect(() => {
    if (!motionEnabled || !sectionRef.current || !frameRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Starting frame: tried larger (0.92 scale × a 2%/3% inset) so the
      // opening stood on its own before any scroll — reverted per the user's
      // call, back to the original small-card distance.
      gsap.set(frameRef.current, {
        scale: 0.62,
        clipPath: "inset(9% 14% round 28px)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          // scrub: true (1:1 with scroll position), not a numeric lag — Lenis
          // is already smoothing the felt scroll input before ScrollTrigger
          // ever sees it, so a second lag here just muddies the response and
          // makes Hero feel looser than Story/Craft right after it, which
          // both track scroll directly.
          scrub: true,
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
          {/* Sized a bit past frameRef's own edges (not inset-0) so the water
              shader's own torn-edge fade — 2% of its own box, see
              water-ripple-image.tsx's edge_alpha — lands outside frameRef's
              clip-path instead of inside it. Otherwise the two edges don't
              line up: the shader fades out before reaching the clip
              boundary, and the gap between them shows frameRef's plain
              background as a second, unintended frame around the photo. */}
          <div ref={parallaxRef} className="absolute -inset-[6%]">
            <WaterRippleImage src="/hero-magang.jpg" playing={motionEnabled && wavesPlaying} />
          </div>

          {motionEnabled && (
            <div
              ref={grainRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{
                backgroundImage: `url("${GRAIN_DATA_URI}")`,
                backgroundSize: "120px 120px",
                opacity: 0.18,
              }}
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
          <h1
            translate="no"
            className="font-heading-zh text-balance text-6xl font-black text-stone [text-shadow:0_0_60px_rgba(224,86,43,0.65)] md:text-9xl"
          >
            拾間
            <span className="font-heading-en mt-3 block text-2xl font-normal italic text-stone/90 md:text-5xl">
              ShiJian
            </span>
          </h1>
          <p className="font-body-en text-xs uppercase tracking-[0.3em] text-stone/70">
            {scrollHint}
          </p>
        </div>

        {motionEnabled && (
          // WCAG 2.2.2：自動播放且長度超過 5 秒的動態內容需提供暫停機制
          <button
            type="button"
            onClick={toggleWaves}
            {...mutePressHandlers}
            aria-label={wavesPlaying ? pauseMotionLabel : playMotionLabel}
            style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            className={`absolute right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-ink/40 text-stone backdrop-blur-sm transition-[background-color,border-color,border-width,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-stone hover:bg-ink/60 active:scale-[0.94] active:border-2 active:border-stone ${
              mutePressed ? "scale-[0.94] border-2 border-stone" : "border-stone/40"
            }`}
          >
            {wavesPlaying ? (
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-current"
              >
                <rect x="3" y="2" width="3.5" height="12" />
                <rect x="9.5" y="2" width="3.5" height="12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-current"
              >
                <path d="M4 2 L14 8 L4 14 Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
