"use client";

import React, {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  ValueAnimationOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";

// Adapted from a 21st.dev community recipe ("box-carousel"). The original
// imported from the "motion/react" package (the Motion library's newer
// entry point); this project already has "framer-motion" installed, whose
// v13 API is the same surface, so the import was switched instead of
// pulling in a second animation dependency. CarouselItem also gained
// linkUrl/caption/subcaption/badge so a face can double as a profile card
// (link + name + quote), which the original recipe didn't need.
interface CarouselItem {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
  linkUrl?: string;
  caption?: string;
  subcaption?: string;
  badge?: string;
}

// Apple「Designing Fluid Interfaces」的橡皮筋阻力公式：離邊界越遠，跟隨程度越低。
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// 同場 talk 的動量投影公式：不是停在放開當下的位置，而是投影到「照這個速度慣性滑下去」會到的位置，
// 再從那個投影點找最近的 90° 停靠點——這樣快速一撥會自然地轉到下一步，而不是差一點又彈回原地。
function project(velocity: number, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

interface FaceProps {
  transform: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  debug?: boolean;
}

const CubeFace = memo(
  ({ transform, className, children, style, debug }: FaceProps) => (
    <div
      className={cn(
        "absolute overflow-hidden",
        debug && "backface-visible opacity-50",
        className
      )}
      style={{ transform, ...style }}
    >
      {children}
    </div>
  )
);

CubeFace.displayName = "CubeFace";

const MediaRenderer = memo(
  ({
    item,
    className,
    debug = false,
    variant = "onLight",
    focusable = true,
  }: {
    item: CarouselItem;
    className?: string;
    debug?: boolean;
    variant?: "onLight" | "onDark";
    focusable?: boolean;
  }) => {
    if (debug) {
      return (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center border text-2xl",
            className
          )}
        >
          {item.id}
        </div>
      );
    }

    const scrimTone =
      variant === "onDark" ? "from-ink/90 via-ink/10" : "from-ink/80 via-ink/5";
    const badgeTone = variant === "onDark" ? "bg-stone text-ink" : "bg-ink text-stone";
    const hasOverlay = item.caption || item.badge;

    const media = (
      <div className="relative h-full w-full overflow-hidden">
        {item.type === "video" ? (
          <video
            src={item.src}
            poster={item.poster}
            className={cn("h-full w-full object-cover", className)}
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt || ""}
            draggable={false}
            className={cn("h-full w-full object-cover", className)}
          />
        )}
        {hasOverlay && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t to-transparent",
              scrimTone
            )}
            aria-hidden="true"
          />
        )}
        {item.badge && (
          <span
            className={cn(
              "font-body-en pointer-events-none absolute left-2 top-2 px-1.5 py-0.5 text-[9px] uppercase tracking-wide",
              badgeTone
            )}
          >
            {item.badge}
          </span>
        )}
        {item.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <p className="text-balance text-base font-bold leading-tight text-stone">
              {item.caption}
            </p>
          </div>
        )}
      </div>
    );

    if (item.linkUrl) {
      return (
        <Link
          href={item.linkUrl}
          draggable={false}
          tabIndex={focusable ? undefined : -1}
          aria-hidden={focusable ? undefined : "true"}
          className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {media}
        </Link>
      );
    }

    return media;
  }
);

MediaRenderer.displayName = "MediaRenderer";

export interface BoxCarouselRef {
  next: () => void;
  prev: () => void;
  getCurrentItemIndex: () => number;
}

type RotationDirection = "top" | "bottom" | "left" | "right";

interface BoxCarouselProps extends React.HTMLProps<HTMLDivElement> {
  items: CarouselItem[];
  width: number;
  height: number;
  className?: string;
  debug?: boolean;
  perspective?: number;
  direction?: RotationDirection;
  transition?: ValueAnimationOptions;
  snapTransition?: ValueAnimationOptions;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onIndexChange?: (index: number) => void;
  enableDrag?: boolean;
  dragSensitivity?: number;
  variant?: "onLight" | "onDark";
  ariaLabel?: string;
  instructions?: string;
}

const BoxCarousel = forwardRef<BoxCarouselRef, BoxCarouselProps>(
  (
    {
      items,
      width,
      height,
      className,
      perspective = 600,
      debug = false,
      direction = "left",
      transition = { duration: 1.25, ease: [0.953, 0.001, 0.019, 0.995] },
      // damping 30／stiffness 200 完全不回彈；放開是一個帶動量的手勢動作，
      // 調低到 22（阻尼比約 0.8）留一點回彈，定格瞬間才不會顯得死板。
      snapTransition = { type: "spring", damping: 22, stiffness: 200 },
      autoPlay = false,
      autoPlayInterval = 3000,
      onIndexChange,
      enableDrag = true,
      dragSensitivity = 0.5,
      variant = "onLight",
      ariaLabel = "3D carousel",
      instructions = "Use the left and right arrow keys, or drag to rotate.",
      ...props
    },
    ref
  ) => {
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [currentFrontFaceIndex, setCurrentFrontFaceIndex] = useState(1);

    const prefersReducedMotion = useReducedMotion();

    const _transition = prefersReducedMotion ? { duration: 0 } : transition;

    const [prevIndex, setPrevIndex] = useState(items.length - 1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1 % items.length);
    const [afterNextIndex, setAfterNextIndex] = useState(2 % items.length);

    const [currentRotation, setCurrentRotation] = useState(0);

    const isRotating = useRef(false);
    const pendingIndexChange = useRef<number | null>(null);
    const isDragging = useRef(false);
    const didDrag = useRef(false);
    const startPosition = useRef({ x: 0, y: 0 });
    const startRotation = useRef(0);
    // 拖曳過程中的位移取樣（px、時間戳），放開時用來算放開瞬間的速度，
    // 決定要投影到哪一步、以及把速度交給定格彈簧，讓拖曳跟定格動畫之間沒有接縫。
    const dragHistory = useRef<{ time: number; delta: number }[]>([]);

    const baseRotateX = useMotionValue(0);
    const baseRotateY = useMotionValue(0);


    const handleAnimationComplete = useCallback(
      (triggeredBy: string) => {
        if (isRotating.current && pendingIndexChange.current !== null) {
          isRotating.current = false

          let newFrontFaceIndex: number;
          let currentBackFaceIndex: number;

          if (triggeredBy === "next") {
            newFrontFaceIndex = (currentFrontFaceIndex + 1) % 4;
            currentBackFaceIndex = (newFrontFaceIndex + 2) % 4;
          } else {
            newFrontFaceIndex = (currentFrontFaceIndex - 1 + 4) % 4;
            currentBackFaceIndex = (newFrontFaceIndex + 3) % 4;
          }

          setCurrentItemIndex(pendingIndexChange.current);
          onIndexChange?.(pendingIndexChange.current);

          const indexOffset = triggeredBy === "next" ? 2 : -1;

          if (currentBackFaceIndex === 0) {
            setPrevIndex(
              (pendingIndexChange.current + indexOffset + items.length) %
                items.length
            );
          } else if (currentBackFaceIndex === 1) {
            setCurrentIndex(
              (pendingIndexChange.current + indexOffset + items.length) %
                items.length
            );
          } else if (currentBackFaceIndex === 2) {
            setNextIndex(
              (pendingIndexChange.current + indexOffset + items.length) %
                items.length
            );
          } else if (currentBackFaceIndex === 3) {
            setAfterNextIndex(
              (pendingIndexChange.current + indexOffset + items.length) %
                items.length
            );
          }

          pendingIndexChange.current = null;

          setCurrentFrontFaceIndex(newFrontFaceIndex);
        }
      },
      [currentFrontFaceIndex, items.length, onIndexChange]
    );

    const handleDragStart = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        // 一定要在 guard 之前重置：否則上一次旋轉還沒結束時按下滑鼠會提早 return，
        // 讓旗標殘留成 true，接著把使用者真正想點的那一下吃掉（就再也進不了人物頁）。
        didDrag.current = false;
        if (!enableDrag || isRotating.current) return;

        isDragging.current = true;
        const point = "touches" in e ? e.touches[0] : e;
        startPosition.current = { x: point.clientX, y: point.clientY };
        startRotation.current = currentRotation;
        dragHistory.current = [{ time: performance.now(), delta: 0 }];

        // 卡片本身是 <Link>，不擋掉的話瀏覽器會啟動原生的連結拖曳（並反白文字），
        // 拖動就變成在拖一個連結縮圖而不是轉動盒子。
        e.preventDefault();
      },
      [enableDrag, currentRotation]
    );

    const handleDragMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!isDragging.current || isRotating.current) return;

        const point = "touches" in e ? e.touches[0] : e;
        const deltaX = point.clientX - startPosition.current.x;
        const deltaY = point.clientY - startPosition.current.y;

        // 超過這個距離才算「拖曳」而不是「點擊」，用來決定放開後要不要吃掉那次點擊
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) didDrag.current = true;

        const isVertical = direction === "top" || direction === "bottom";
        const delta = isVertical ? deltaY : deltaX;

        // 只留最近 100ms 內的取樣，這樣算出來的是「放開前那一刻」的速度，
        // 而不是被整段拖曳過程的平均值稀釋掉。
        const now = performance.now();
        dragHistory.current.push({ time: now, delta });
        dragHistory.current = dragHistory.current.filter(
          (sample) => now - sample.time <= 100
        );

        const rotationDelta = (delta * dragSensitivity) / 2;

        let newRotation = startRotation.current;

        if (direction === "top" || direction === "right") {
          newRotation += rotationDelta;
        } else {
          newRotation -= rotationDelta;
        }

        // 超過 ±120° 上限時不硬停，改用漸進阻力（越拖越難拖動）：
        // 手感上像「到底了但還有一點彈性」，而不是「卡住了」。
        const minRotation = startRotation.current - 120;
        const maxRotation = startRotation.current + 120;
        if (newRotation > maxRotation) {
          newRotation = maxRotation + rubberband(newRotation - maxRotation, 90);
        } else if (newRotation < minRotation) {
          newRotation = minRotation - rubberband(minRotation - newRotation, 90);
        }

        if (isVertical) {
          baseRotateX.set(newRotation);
        } else {
          baseRotateY.set(newRotation);
        }
      },
      [direction, dragSensitivity, baseRotateX, baseRotateY]
    );

    const handleDragEnd = useCallback(() => {
      if (!isDragging.current) return;

      isDragging.current = false;

      const isVertical = direction === "top" || direction === "bottom";
      const currentValue = isVertical ? baseRotateX.get() : baseRotateY.get();

      // 放開前 100ms 內的位移／時間，換算成 px/s 的釋放速度
      const history = dragHistory.current;
      let pxVelocity = 0;
      if (history.length >= 2) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const dt = (newest.time - oldest.time) / 1000;
        if (dt > 0) pxVelocity = (newest.delta - oldest.delta) / dt;
      }
      // px 速度先投影成「慣性滑到底」會多滑的 px 距離，再用跟拖曳時同一套
      // px→度數換算（dragSensitivity/2）轉回旋轉度數，這樣快速一撥可以直接
      // 帶著慣性轉到下一步，而不是只看放開當下卡在哪個角度。
      const projectedPx = project(pxVelocity);
      const directionSign =
        direction === "top" || direction === "right" ? 1 : -1;
      const projectedRotationOffset =
        directionSign * (projectedPx * dragSensitivity) / 2;
      const rotationVelocity = directionSign * (pxVelocity * dragSensitivity) / 2;

      const projectedValue = currentValue + projectedRotationOffset;
      const quarterRotations = Math.round(projectedValue / 90);
      const snappedRotation = quarterRotations * 90;

      const rotationDifference = snappedRotation - currentRotation;
      const steps = Math.round(rotationDifference / 90);

      if (steps !== 0) {
        isRotating.current = true;

        let newItemIndex = currentItemIndex;
        for (let i = 0; i < Math.abs(steps); i++) {
          if (steps > 0) {
            newItemIndex = (newItemIndex + 1) % items.length;
          } else {
            newItemIndex =
              newItemIndex === 0 ? items.length - 1 : newItemIndex - 1;
          }
        }

        pendingIndexChange.current = newItemIndex;

        const targetMotionValue = isVertical ? baseRotateX : baseRotateY;
        animate(targetMotionValue, snappedRotation, {
          ...snapTransition,
          velocity: rotationVelocity,
          onComplete: () => {
            handleAnimationComplete(steps > 0 ? "next" : "prev");
            setCurrentRotation(snappedRotation);
          },
        });
      } else {
        const targetMotionValue = isVertical ? baseRotateX : baseRotateY;
        animate(targetMotionValue, currentRotation, {
          ...snapTransition,
          velocity: rotationVelocity,
        });
      }
    }, [
      direction,
      dragSensitivity,
      baseRotateX,
      baseRotateY,
      currentRotation,
      currentItemIndex,
      items.length,
      snapTransition,
      handleAnimationComplete,
    ]);

    useEffect(() => {
      if (enableDrag) {
        window.addEventListener("mousemove", handleDragMove);
        window.addEventListener("mouseup", handleDragEnd);
        window.addEventListener("touchmove", handleDragMove);
        window.addEventListener("touchend", handleDragEnd);

        return () => {
          window.removeEventListener("mousemove", handleDragMove);
          window.removeEventListener("mouseup", handleDragEnd);
          window.removeEventListener("touchmove", handleDragMove);
          window.removeEventListener("touchend", handleDragEnd);
        };
      }
    }, [enableDrag, handleDragMove, handleDragEnd]);

    const next = useCallback(() => {
      if (items.length === 0 || isRotating.current) return;

      isRotating.current = true;
      const newIndex = (currentItemIndex + 1) % items.length;
      pendingIndexChange.current = newIndex;

      if (direction === "top") {
        animate(baseRotateX, currentRotation + 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("next");
            setCurrentRotation(currentRotation + 90);
          },
        });
      } else if (direction === "bottom") {
        animate(baseRotateX, currentRotation - 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("next");
            setCurrentRotation(currentRotation - 90);
          },
        });
      } else if (direction === "left") {
        animate(baseRotateY, currentRotation - 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("next");
            setCurrentRotation(currentRotation - 90);
          },
        });
      } else if (direction === "right") {
        animate(baseRotateY, currentRotation + 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("next");
            setCurrentRotation(currentRotation + 90);
          },
        });
      }
    }, [
      items.length,
      direction,
      currentRotation,
      currentItemIndex,
      _transition,
      baseRotateX,
      baseRotateY,
      handleAnimationComplete,
    ]);

    const prev = useCallback(() => {
      if (items.length === 0 || isRotating.current) return;

      isRotating.current = true;
      const newIndex =
        currentItemIndex === 0 ? items.length - 1 : currentItemIndex - 1;
      pendingIndexChange.current = newIndex;

      if (direction === "top") {
        animate(baseRotateX, currentRotation - 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("prev");
            setCurrentRotation(currentRotation - 90);
          },
        });
      } else if (direction === "bottom") {
        animate(baseRotateX, currentRotation + 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("prev");
            setCurrentRotation(currentRotation + 90);
          },
        });
      } else if (direction === "left") {
        animate(baseRotateY, currentRotation + 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("prev");
            setCurrentRotation(currentRotation + 90);
          },
        });
      } else if (direction === "right") {
        animate(baseRotateY, currentRotation - 90, {
          ..._transition,
          onComplete: () => {
            handleAnimationComplete("prev");
            setCurrentRotation(currentRotation - 90);
          },
        });
      }
    }, [
      items.length,
      direction,
      currentRotation,
      currentItemIndex,
      _transition,
      baseRotateX,
      baseRotateY,
      handleAnimationComplete,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        next,
        prev,
        getCurrentItemIndex: () => currentItemIndex,
      }),
      [next, prev, currentItemIndex]
    );

    const depth = useMemo(
      () => (direction === "top" || direction === "bottom" ? height : width),
      [direction, width, height]
    );

    // 拖曳時刻意不走彈簧：直接操作要 1:1 跟著游標，中間隔一層彈簧會有跟不上的延遲感。
    const transform = useTransform(
      [baseRotateX, baseRotateY],
      ([x, y]) => `translateZ(-${depth / 2}px) rotateX(${x}deg) rotateY(${y}deg)`
    );

    const faceTransforms = (() => {
      switch (direction) {
        case "left":
          return [
            `rotateY(-90deg) translateZ(${width / 2}px)`,
            `rotateY(0deg) translateZ(${depth / 2}px)`,
            `rotateY(90deg) translateZ(${width / 2}px)`,
            `rotateY(180deg) translateZ(${depth / 2}px)`,
          ];
        case "top":
          return [
            `rotateX(90deg) translateZ(${height / 2}px)`,
            `rotateY(0deg) translateZ(${depth / 2}px)`,
            `rotateX(-90deg) translateZ(${height / 2}px)`,
            `rotateY(180deg) translateZ(${depth / 2}px) rotateZ(180deg)`,
          ];
        case "right":
          return [
            `rotateY(90deg) translateZ(${width / 2}px)`,
            `rotateY(0deg) translateZ(${depth / 2}px)`,
            `rotateY(-90deg) translateZ(${width / 2}px)`,
            `rotateY(180deg) translateZ(${depth / 2}px)`,
          ];
        case "bottom":
          return [
            `rotateX(-90deg) translateZ(${height / 2}px)`,
            `rotateY(0deg) translateZ(${depth / 2}px)`,
            `rotateX(90deg) translateZ(${height / 2}px)`,
            `rotateY(180deg) translateZ(${depth / 2}px) rotateZ(180deg)`,
          ];
        default:
          return [
            `rotateY(-90deg) translateZ(${width / 2}px)`,
            `rotateY(0deg) translateZ(${depth / 2}px)`,
            `rotateY(90deg) translateZ(${width / 2}px)`,
            `rotateY(180deg) translateZ(${depth / 2}px)`,
          ];
      }
    })();

    useEffect(() => {
      if (autoPlay && items.length > 0) {
        const interval = setInterval(next, autoPlayInterval);
        return () => clearInterval(interval);
      }
    }, [autoPlay, items.length, next, autoPlayInterval]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isRotating.current) return;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            if (direction === "left" || direction === "right") prev();
            break;
          case "ArrowRight":
            e.preventDefault();
            if (direction === "left" || direction === "right") next();
            break;
          case "ArrowUp":
            e.preventDefault();
            if (direction === "top" || direction === "bottom") prev();
            break;
          case "ArrowDown":
            e.preventDefault();
            if (direction === "top" || direction === "bottom") next();
            break;
          default:
            break;
        }
      },
      [direction, next, prev]
    );

    if (items.length === 0) return null;

    return (
      <div
        className={cn("relative focus:outline-0", enableDrag && "cursor-grab active:cursor-grabbing", className)}
        style={{
          width,
          height,
          perspective: `${perspective}px`,
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby="carousel-instructions"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClickCapture={(e) => {
          // 拖曳結束時卡片（<Link>）仍會收到一次 click，不擋掉就會轉一轉就跳走
          if (didDrag.current) {
            e.preventDefault();
            e.stopPropagation();
            didDrag.current = false;
          }
        }}
        {...props}
      >
        <div id="carousel-instructions" className="sr-only">
          {instructions}
        </div>
        <div className="sr-only" aria-live="assertive">
          Showing item {currentItemIndex + 1} of {items.length}:{" "}
          {items[currentItemIndex]?.alt || `Item ${currentItemIndex + 1}`}
        </div>

        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          style={{ transform }}
        >
          <CubeFace
            transform={faceTransforms[0]}
            style={debug ? { width, height, backgroundColor: "#ff9999" } : { width, height }}
            debug={debug}
          >
            <MediaRenderer
              item={items[prevIndex]}
              debug={debug}
              variant={variant}
              focusable={currentFrontFaceIndex === 0}
            />
          </CubeFace>

          <CubeFace
            transform={faceTransforms[1]}
            style={debug ? { width, height, backgroundColor: "#99ff99" } : { width, height }}
            debug={debug}
          >
            <MediaRenderer
              item={items[currentIndex]}
              debug={debug}
              variant={variant}
              focusable={currentFrontFaceIndex === 1}
            />
          </CubeFace>

          <CubeFace
            transform={faceTransforms[2]}
            style={debug ? { width, height, backgroundColor: "#9999ff" } : { width, height }}
            debug={debug}
          >
            <MediaRenderer
              item={items[nextIndex]}
              debug={debug}
              variant={variant}
              focusable={currentFrontFaceIndex === 2}
            />
          </CubeFace>

          <CubeFace
            transform={faceTransforms[3]}
            style={debug ? { width, height, backgroundColor: "#ffff99" } : { width, height }}
            debug={debug}
          >
            <MediaRenderer
              item={items[afterNextIndex]}
              debug={debug}
              variant={variant}
              focusable={currentFrontFaceIndex === 3}
            />
          </CubeFace>
        </motion.div>
      </div>
    );
  }
);

BoxCarousel.displayName = "BoxCarousel";

export default BoxCarousel;
export { MediaRenderer };
export type { CarouselItem, RotationDirection };
