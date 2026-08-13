"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const [videoPlaying, setVideoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!motionEnabled || !video) return;
    const handlePlay = () => setVideoPlaying(true);
    const handlePause = () => setVideoPlaying(false);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [motionEnabled]);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !videoPlaying;
    setVideoPlaying(next);
    if (next) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

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
              ref={videoRef}
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
          <h1
            translate="no"
            className="font-heading-zh text-balance text-5xl font-black text-stone md:text-8xl"
          >
            拾間
            <span className="font-heading-en mt-2 block text-2xl font-normal italic text-stone/90 md:text-4xl">
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
            onClick={toggleVideo}
            aria-label={videoPlaying ? pauseMotionLabel : playMotionLabel}
            style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            className="absolute right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-stone/40 bg-ink/40 text-stone backdrop-blur-sm transition-colors hover:border-stone hover:bg-ink/60"
          >
            {videoPlaying ? (
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
