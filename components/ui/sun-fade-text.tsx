"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { TIDE_COLORS } from "@/lib/soak-dry-colors";

export interface SunFadeTextProps {
  /** The blocks, read in order. Each one is laid out wet and dark, then dried by scroll through the seven real colour stages of 七泡七曬. */
  sections: string[];
  /** Scroll distance each block gets. Taller is slower. Default `"200vh"`. */
  runway?: string;
  /** Font utility class applied to each text block (zh/en heading fonts are picked per-locale). */
  fontClassName?: string;
  /** Rendered behind the text blocks, inside the pinned frame. */
  backdrop?: React.ReactNode;
  /** Counter text for the stage the front block has reached, 1-based out of 7. */
  stageLabel?: (stage: number, total: number) => string;
  className?: string;
}

const STAGES = TIDE_COLORS.length;
/** Slot progress by which the block has faded in, still at the first (wet, dark) stage. */
const LAID_AT = 0.12;
/** Slot progress by which every glyph has reached the last stage. */
const DRY_AT = 0.72;
/** Slot progress at which a dried block starts to clear for the next one. The last block never clears. */
const CLEAR_AT = 0.9;
/**
 * How far apart the first and last glyph to dry are, in units of the whole
 * drying span. Gelidium spread on the plaza never dries evenly — thin fronds
 * and the side facing the sun go first — so the colour moves across the copy
 * as a front instead of the whole block switching at once.
 */
const SPREAD = 0.55;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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

/**
 * 曬褪字：取代原本的燒字效果。剛採上岸的石花菜是深紫褐色，經過「七泡七曬」
 * 一階一階褪成米白——這裡的字也一樣，捲動就是日曬，字從深紫褐（在深色底上
 * 幾乎看不見）一階一階曬到米白（最清楚）。顏色是 TideProgress 那七個真實色階，
 * 刻意一階一階跳、不做平滑漸層：七次泡曬是七個分開的步驟，不是一條連續曲線。
 */
export function SunFadeText({
  sections,
  runway = "200vh",
  fontClassName,
  backdrop,
  stageLabel,
  className,
}: SunFadeTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const runwayRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const blockRefs = React.useRef<(HTMLParagraphElement | null)[]>([]);

  const count = sections.length;
  const total = React.useRef(count);
  total.current = count;
  const label = React.useRef(stageLabel);
  label.current = stageLabel;

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const el = runwayRef.current;
    if (!el) return;

    // 跟 ScrollBurnText 一樣走 ScrollTrigger：全站捲動由 Lenis 驅動，原生
    // scroll 事件在這裡不可靠（見 SmoothScroll.tsx）。
    gsap.registerPlugin(ScrollTrigger);

    // 每個字乾燥的先後是排版後才知道的事（字落在第幾行、靠哪一邊），所以量一次
    // 存起來，不是用字的序號算——用序號會變成照閱讀順序一個一個刷過去。
    const thresholds: number[][] = [];
    const measure = () => {
      blockRefs.current.forEach((block, i) => {
        if (!block) return;
        const w = block.offsetWidth || 1;
        const h = block.offsetHeight || 1;
        thresholds[i] = (Array.from(block.children) as HTMLElement[]).map((node) => {
          const x = (node.offsetLeft + node.offsetWidth / 2) / w;
          const y = (node.offsetTop + node.offsetHeight / 2) / h;
          // 日照從左上斜斜掃過來，再疊一點不規則：攤在地上的石花菜厚薄不一，
          // 不會是一條筆直的分界線。
          const uneven =
            0.5 + 0.3 * Math.sin(x * 9.1 + y * 4.3 + 0.8) + 0.2 * Math.sin(x * 3.7 - y * 11.2 + 2.6);
          return clamp01(0.55 * (x * 0.65 + y * 0.35) + 0.45 * uneven);
        });
      });
    };

    // 只在某個字真的換階的時候才寫它的顏色，每一幀不必重寫幾百個字。
    const painted: number[][] = [];
    let shownStage = -1;

    const update = (p: number) => {
      const count = total.current;
      const t = p * count;
      const front = Math.min(count - 1, Math.floor(t));

      blockRefs.current.forEach((block, i) => {
        const wrap = block?.parentElement;
        if (!block || !wrap) return;
        const q = t - i;
        const last = i === count - 1;

        const alpha =
          q < 0 ? 0 : clamp01(q / LAID_AT) * (last ? 1 : 1 - clamp01((q - CLEAR_AT) / (1 - CLEAR_AT)));
        if (alpha <= 0) {
          wrap.style.visibility = "hidden";
          return;
        }
        wrap.style.visibility = "visible";
        wrap.style.opacity = `${alpha}`;

        const dry = clamp01((q - LAID_AT) / (DRY_AT - LAID_AT));
        const glyphs = block.children;
        const own = thresholds[i] ?? [];
        const done = (painted[i] ??= []);
        for (let k = 0; k < glyphs.length; k++) {
          const local = clamp01(dry * (1 + SPREAD) - (own[k] ?? 0) * SPREAD);
          const stage = Math.min(STAGES - 1, Math.floor(local * STAGES));
          if (done[k] !== stage) {
            done[k] = stage;
            (glyphs[k] as HTMLElement).style.color = TIDE_COLORS[stage];
          }
        }

        if (i === front && counterRef.current && label.current) {
          const stage = Math.min(STAGES, Math.floor(dry * STAGES) + 1);
          if (stage !== shownStage) {
            shownStage = stage;
            counterRef.current.textContent = label.current(stage, STAGES);
          }
        }
      });
    };

    measure();

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
      // 正式字體載入、或視窗縮放後字寬會變，乾燥的先後要重量一次。
      onRefresh: (self) => {
        measure();
        painted.length = 0;
        update(self.progress);
      },
    });

    update(st.progress);

    return () => {
      st.kill();
    };
  }, [prefersReducedMotion]);

  const column = cn(
    "relative w-[min(84vw,36rem)] text-center text-[clamp(1.375rem,7vw,3.25rem)] font-bold leading-[1.2] tracking-tight",
    fontClassName,
  );

  if (prefersReducedMotion) {
    // 不捲動也看得到最後曬好的樣子：直接用最後一階米白。
    return (
      <div className={cn("w-full px-6 py-24", className)}>
        <div className="mx-auto grid max-w-2xl gap-10">
          {sections.map((body, i) => (
            <p
              key={i}
              className={cn(column, "w-full text-left")}
              style={{ color: TIDE_COLORS[STAGES - 1] }}
            >
              {body}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div ref={runwayRef} style={{ height: `calc(${runway} * ${count})` }} className="w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {backdrop}

          <div
            ref={counterRef}
            className="pointer-events-none absolute bottom-5 left-6 z-10 font-body-en text-[0.65rem] font-medium uppercase tracking-[0.22em] tabular-nums text-stone/50"
          />

          {sections.map((body, i) => (
            <div
              key={i}
              style={{ visibility: "hidden" }}
              className="absolute inset-0 grid place-items-center"
              aria-hidden
            >
              <p
                ref={(node) => {
                  blockRefs.current[i] = node;
                }}
                className={column}
                style={{ color: TIDE_COLORS[0] }}
              >
                {Array.from(body).map((ch, k) =>
                  ch === " " ? (
                    " "
                  ) : (
                    // 換階時顏色過渡一下，讀起來是「曬淡了一層」，不是閃一下。
                    <span key={k} className="transition-colors duration-500 ease-out">
                      {ch}
                    </span>
                  ),
                )}
              </p>
            </div>
          ))}

          {/* 視覺上拆成一個一個字，輔助技術會念成散字，所以完整文字另外放一份。 */}
          <p className="sr-only">{sections.join(" ")}</p>
        </div>
      </div>
    </div>
  );
}

export default SunFadeText;
