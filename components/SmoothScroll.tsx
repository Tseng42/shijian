"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // duration 越長，畫面跟實際捲動輸入的落差越明顯——像 Story 那種畫面本身
    // 大幅度變化的效果，落差感會被放大。調短讓畫面更貼著使用者捲到哪裡。
    const lenis = new Lenis({ duration: 0.7 });
    lenis.on("scroll", ScrollTrigger.update);

    const syncLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(syncLenis);
    gsap.ticker.lagSmoothing(0);

    // 中文字體（Noto Sans/Serif TC）從 fallback 換成正式字體時會改變段落高度，
    // 導致已經算好的 ScrollTrigger／pin 位置過期，捲動時會突然跳位。
    // 字體就緒與整頁載入完成後都重新量測一次，修正過期的觸發位置。
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh);
    }

    return () => {
      gsap.ticker.remove(syncLenis);
      lenis.destroy();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return <>{children}</>;
}
