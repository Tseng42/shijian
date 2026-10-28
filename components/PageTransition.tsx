"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIDE_COLORS } from "@/lib/soak-dry-colors";

// 敲打：曬好的石花菜要用大木棍反覆敲打，破壞纖維、剔除附著的鈣質（craft.json
// 「敲打與出貨」）。換頁就是敲一下——一整片曬到米白的石花菜（七泡七曬的最後
// 一階）從上方敲下來蓋滿畫面，敲下的那一下輕震；掀開時拆成一條條纖維往下散，
// 細白的鈣質粉末跟著落下。纖維從「使用者實際點擊的位置」先落，像木棍敲在那裡。
const FIBERS = 16;
const DUST = 36;
const DRIED = TIDE_COLORS[TIDE_COLORS.length - 1];
const STRAW = TIDE_COLORS[TIDE_COLORS.length - 2];

export default function PageTransition() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fiberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustRef = useRef<HTMLDivElement>(null);
  const originX = useRef(0.5);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setReduceMotion(event.matches);
    mql.addEventListener("change", handleChange);

    const handleClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest("a");
      if (!link || !window.innerWidth) return;
      originX.current = event.clientX / window.innerWidth;
    };
    document.addEventListener("click", handleClick, true);

    return () => {
      mql.removeEventListener("change", handleChange);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    window.scrollTo(0, 0);

    const overlay = overlayRef.current;
    const dust = dustRef.current;
    const fibers = fiberRefs.current.filter((f): f is HTMLDivElement => !!f);
    if (!overlay || !dust || fibers.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.killTweensOf([overlay, ...fibers, ...Array.from(dust.children)]);

    // 減少動態：不敲、不散，只是整片淡入再淡出。
    if (reduceMotion) {
      gsap.set(fibers, { yPercent: 0, rotation: 0 });
      gsap
        .timeline({ onComplete: () => ScrollTrigger.refresh() })
        .set(overlay, { visibility: "visible", opacity: 0 })
        .to(overlay, { opacity: 1, duration: 0.15 })
        .to(overlay, { opacity: 0, duration: 0.25 })
        .set(overlay, { visibility: "hidden" });
      return;
    }

    const hitIndex = Math.min(FIBERS - 1, Math.floor(originX.current * FIBERS));
    // 總長控制在 1 秒左右：敲下 0.26 + 反震 0.17 + 掀開 0.4，加上纖維之間的錯開。
    const fromHit = { each: 0.008, from: hitIndex } as const;

    gsap.set(overlay, { visibility: "visible", opacity: 1, y: 0 });
    gsap.set(fibers, { yPercent: -105, rotation: 0 });
    // 粉末沿著整片的底緣散開，每次位置都不一樣。
    const specks = Array.from(dust.children) as HTMLElement[];
    specks.forEach((speck) => {
      gsap.set(speck, {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight * (0.55 + Math.random() * 0.45),
        opacity: 0,
        scale: 0.6 + Math.random() * 0.9,
      });
    });

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(overlay, { visibility: "hidden" });
          ScrollTrigger.refresh();
        },
      })
      // 敲下：越接近點擊處的纖維越早落地，加速度往下，最後重重停住。
      .to(fibers, { yPercent: 0, duration: 0.26, ease: "power3.in", stagger: fromHit })
      // 落地那一下的反震。
      .to(overlay, { y: 7, duration: 0.05, ease: "power1.out" })
      .to(overlay, { y: 0, duration: 0.12, ease: "power2.out" })
      // 掀開：纖維鬆開往下散，各自帶一點歪斜；粉末同時從底下落出來。
      .to(
        fibers,
        {
          yPercent: 110,
          rotation: () => gsap.utils.random(-4, 4),
          duration: 0.4,
          ease: "power2.in",
          stagger: fromHit,
        },
        "+=0.04"
      )
      .to(
        specks,
        {
          keyframes: [
            { opacity: 0.9, duration: 0.08 },
            { opacity: 0, duration: 0.5 },
          ],
          y: `+=${window.innerHeight * 0.5}`,
          x: () => `+=${gsap.utils.random(-30, 30)}`,
          duration: 0.5,
          ease: "power1.in",
          stagger: { each: 0.008, from: "random" },
        },
        "<"
      );
  }, [pathname, reduceMotion]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex"
      style={{ visibility: "hidden" }}
    >
      {Array.from({ length: FIBERS }, (_, i) => (
        <div
          key={i}
          ref={(node) => {
            fiberRefs.current[i] = node;
          }}
          // 每條纖維稍微超出自己的寬度、底緣圓鈍長短不一，蓋下來是一整片，
          // 掀開時才看得出是一條一條。細直紋是乾石花菜的纖維質地。
          className="relative -mx-px h-[104%] flex-1 rounded-b-full"
          style={{
            backgroundColor: DRIED,
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 5px, ${STRAW}55 5px 6px, transparent 6px 11px)`,
            marginBottom: `${(i * 37) % 5}%`,
          }}
        />
      ))}
      <div ref={dustRef} className="absolute inset-0">
        {Array.from({ length: DUST }, (_, i) => (
          <span
            key={i}
            // 粉末是白的，新頁面多半也是淺色底；加一圈很淡的墨色邊，落在淺底上才看得到。
            className="absolute left-0 top-0 h-1 w-1 rounded-full shadow-[0_0_0_1px_rgba(15,22,32,0.22)]"
            style={{ backgroundColor: DRIED, opacity: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
