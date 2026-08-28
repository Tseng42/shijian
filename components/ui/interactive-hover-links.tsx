"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Same settle curve img-stack.tsx uses for its drag-release snap — borrowed
// rather than left on framer's bare `type: "spring"` default (looser, with
// overshoot) so the two places on the site with a "let go and it settles"
// moment read as the same hand, not two different libraries' defaults. The
// cursor-follow position below stays a real spring — it's continuously
// retargeted on every mousemove, which is what springs are for.
const SETTLE = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

export interface InteractiveHoverLinkItem {
  id: string;
  heading: string;
  subheading: string;
  href: string;
  image?: { src: string; alt: string };
  /** Shown instead of the floating photo when `image` isn't set yet. */
  pendingLabel?: string;
}

// Adapted from a 21st.dev community recipe ("InteractiveHoverLinks"): a list
// of big headings where the letters spread apart and a photo swings in,
// following the cursor, on hover. The original had no reduced-motion branch
// and only responded to the mouse (whileHover, an onMouseMove handler) — a
// keyboard user tabbing through would get none of it, including the arrow
// that's the only visual cue this is a link at all. Reworked here with a
// static fallback and whileFocus mirroring whileHover.
export default function InteractiveHoverLinks({
  links,
  className,
}: {
  links: InteractiveHoverLinkItem[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {links.map((link) => (
        <LinkRow key={link.id} {...link} />
      ))}
    </div>
  );
}

function LinkRow({ heading, subheading, href, image, pendingLabel }: InteractiveHoverLinkItem) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const top = useTransform(mouseYSpring, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["60%", "40%"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const resetSpring = () => {
    x.set(0);
    y.set(0);
  };

  if (reducedMotion) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-6 border-b border-ink/15 py-6 outline-none transition-colors hover:border-ink focus-visible:border-ink md:py-10"
      >
        <span className="flex items-center gap-4">
          {image && (
            <img
              src={image.src}
              alt={image.alt}
              width={64}
              height={64}
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          )}
          <span>
            <span className="font-heading-zh block text-3xl font-black text-ink md:text-5xl">
              {heading}
            </span>
            <span className="mt-1 block text-sm text-ink/60">
              {image ? subheading : pendingLabel}
            </span>
          </span>
        </span>
        <ArrowIcon className="h-6 w-6 shrink-0 text-ink/40 group-hover:text-ink" />
      </a>
    );
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetSpring}
      onBlur={resetSpring}
      initial="initial"
      whileHover="whileHover"
      whileFocus="whileHover"
      className="group relative flex items-center justify-between gap-6 overflow-hidden border-b border-ink/15 py-6 outline-none transition-colors duration-500 hover:border-ink focus-visible:border-ink md:py-10"
    >
      <span>
        <motion.span
          variants={{ initial: { x: 0 }, whileHover: { x: -12 } }}
          transition={{ ...SETTLE, staggerChildren: 0.05, delayChildren: 0.15 }}
          className="relative z-10 block text-4xl font-black text-ink transition-colors duration-500 md:text-6xl"
        >
          {Array.from(heading).map((glyph, i) => (
            <motion.span
              key={i}
              variants={{ initial: { x: 0 }, whileHover: { x: 12 } }}
              transition={SETTLE}
              className="inline-block"
            >
              {glyph}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative z-10 mt-2 block text-sm text-ink/60">
          {image ? subheading : pendingLabel}
        </span>
      </span>

      {image && (
        <motion.img
          aria-hidden="true"
          style={{ top, left, translateX: "-10%", translateY: "-50%" }}
          variants={{
            initial: { scale: 0, rotate: "-12.5deg" },
            whileHover: { scale: 1, rotate: "12.5deg" },
          }}
          transition={SETTLE}
          src={image.src}
          alt=""
          width={256}
          height={192}
          className="pointer-events-none absolute z-0 h-24 w-32 rounded-lg object-cover shadow-lg md:h-48 md:w-64"
        />
      )}

      <span className="relative z-10 shrink-0 overflow-hidden">
        <motion.span
          variants={{
            initial: { x: "100%", opacity: 0 },
            whileHover: { x: "0%", opacity: 1 },
          }}
          transition={SETTLE}
          className="block p-1"
        >
          <ArrowIcon className="h-8 w-8 text-ink md:h-12 md:w-12" />
        </motion.span>
      </span>
    </motion.a>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
