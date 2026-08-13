"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 轉場：硃紅圓形從「使用者實際點擊的位置」蓋章式放大蓋滿全螢幕，再縮回同一點消失，
// 呼應背景那個「游標移到哪、哪裡就被蓋章」的視覺語言，而不是隨機從畫面正中央播放。
export default function PageTransition() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: "50%", y: "50%" });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setReduceMotion(event.matches);
    mql.addEventListener("change", handleChange);

    const handleClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest("a");
      if (!link || !window.innerWidth || !window.innerHeight) return;
      origin.current = {
        x: `${(event.clientX / window.innerWidth) * 100}%`,
        y: `${(event.clientY / window.innerHeight) * 100}%`,
      };
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

    if (reduceMotion || !overlayRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const overlay = overlayRef.current;
    overlay.style.left = origin.current.x;
    overlay.style.top = origin.current.y;
    gsap.set(overlay, { xPercent: -50, yPercent: -50, scale: 0 });

    gsap
      .timeline({ onComplete: () => ScrollTrigger.refresh() })
      .to(overlay, { scale: 1, duration: 0.4, ease: "power3.in" })
      .to(overlay, { scale: 0, duration: 0.5, ease: "power3.out" }, "+=0.05");
  }, [pathname, reduceMotion]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-50 rounded-full bg-accent"
      style={{ width: "250vmax", height: "250vmax", left: 0, top: 0 }}
    />
  );
}
