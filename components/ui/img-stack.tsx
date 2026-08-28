"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { MediaRenderer, type CarouselItem } from "@/components/ui/box-carousel";

// Adapted from a 21st.dev community recipe ("img-stack"): a draggable photo
// stack where the front card flicks to the back on release. The original had
// no keyboard path, no screen-reader announcement, and only ever advanced
// forward (nothing to bring the last card back to front) — this project's
// existing carousel already earned all three, so they're rebuilt in here
// rather than lost in the swap. Face rendering (link, caption, badge, focus
// gating) reuses MediaRenderer from box-carousel.tsx instead of duplicating it.

export interface ImgStackRef {
  next: () => void;
  prev: () => void;
  getCurrentItemIndex: () => number;
}

interface ImgStackProps {
  items: CarouselItem[];
  width: number;
  height: number;
  variant?: "onLight" | "onDark";
  ariaLabel?: string;
  instructions?: string;
  onIndexChange?: (index: number) => void;
}

const MIN_DRAG_DISTANCE = 60;
const VISIBLE_DEPTH = 3;

const ImgStack = forwardRef<ImgStackRef, ImgStackProps>(
  (
    {
      items,
      width,
      height,
      variant = "onLight",
      ariaLabel = "Photo stack",
      instructions = "Click or drag the top photo aside, or use the left and right arrow keys.",
      onIndexChange,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();
    // order[0] 是目前最上面那張，其餘依序疊在後面——換卡只是重排這個陣列，
    // 不用另外追蹤旋轉角度或 z-index 狀態機。
    const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
    const [isAnimating, setIsAnimating] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const advance = useCallback(
      (dir: 1 | -1) => {
        if (isAnimating || items.length < 2) return;
        setIsAnimating(true);
        setOrder((prev) => {
          const next =
            dir === 1
              ? [...prev.slice(1), prev[0]]
              : [prev[prev.length - 1], ...prev.slice(0, -1)];
          onIndexChange?.(next[0]);
          return next;
        });
        window.setTimeout(() => setIsAnimating(false), prefersReducedMotion ? 0 : 320);
      },
      [isAnimating, items.length, onIndexChange, prefersReducedMotion]
    );

    useImperativeHandle(
      ref,
      () => ({
        next: () => advance(1),
        prev: () => advance(-1),
        getCurrentItemIndex: () => order[0] ?? 0,
      }),
      [advance, order]
    );

    const handleDragStart = (_: unknown, info: PanInfo) => {
      dragStart.current = { x: info.point.x, y: info.point.y };
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      const dx = info.point.x - dragStart.current.x;
      const dy = info.point.y - dragStart.current.y;
      if (Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE) advance(1);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        advance(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        advance(1);
      }
    };

    if (items.length === 0) return null;

    const currentItem = items[order[0]];

    if (prefersReducedMotion) {
      // 靜止版本：不做堆疊扇形、不做拖曳物理，只顯示最上面那張，
      // 上一張/下一張全部交給既有的按鈕跟鍵盤，跟其他動效元件同一套原則。
      return (
        <div
          className="relative outline-none"
          style={{ width, height }}
          tabIndex={0}
          role="group"
          aria-label={ariaLabel}
          aria-describedby="img-stack-instructions"
          onKeyDown={handleKeyDown}
        >
          <div id="img-stack-instructions" className="sr-only">
            {instructions}
          </div>
          <div className="sr-only" aria-live="assertive">
            Showing item {order[0] + 1} of {items.length}: {currentItem?.alt || ""}
          </div>
          <button
            type="button"
            onClick={() => advance(1)}
            className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <MediaRenderer item={currentItem} variant={variant} focusable={false} />
          </button>
        </div>
      );
    }

    return (
      <div
        className="relative outline-none"
        style={{ width, height, perspective: 900 }}
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        aria-describedby="img-stack-instructions"
        onKeyDown={handleKeyDown}
      >
        <div id="img-stack-instructions" className="sr-only">
          {instructions}
        </div>
        <div className="sr-only" aria-live="assertive">
          Showing item {order[0] + 1} of {items.length}: {currentItem?.alt || ""}
        </div>

        {order.slice(0, VISIBLE_DEPTH).map((itemIndex, stackPos) => {
          const isTop = stackPos === 0;
          const item = items[itemIndex];

          return (
            <motion.div
              key={itemIndex}
              className={`absolute inset-0 origin-bottom overflow-hidden rounded-sm shadow-xl ${isTop ? "cursor-pointer" : ""}`}
              style={{ zIndex: VISIBLE_DEPTH - stackPos }}
              animate={{
                x: stackPos * -14,
                y: stackPos * -10,
                rotate: isTop ? 0 : -(4 + stackPos * 4),
                scale: 1 - stackPos * 0.04,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              drag={isTop && !isAnimating}
              dragElastic={0.25}
              dragConstraints={{ left: -160, right: 160, top: -160, bottom: 160 }}
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 500, bounceDamping: 24 }}
              onDragStart={isTop ? handleDragStart : undefined}
              onDragEnd={isTop ? handleDragEnd : undefined}
              onTap={isTop ? () => advance(1) : undefined}
              whileDrag={{ scale: 1.03, rotate: 0, zIndex: VISIBLE_DEPTH + 1 }}
              whileTap={isTop ? { scale: 0.97 } : undefined}
            >
              <MediaRenderer item={item} variant={variant} focusable={false} />
            </motion.div>
          );
        })}
      </div>
    );
  }
);

ImgStack.displayName = "ImgStack";

export default ImgStack;
