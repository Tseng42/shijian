"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Person } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/config";
import { useSound } from "./SoundProvider";
import { playHoverTick } from "@/lib/sound";

const MotionLink = motion(Link);

type PersonCardProps = {
  person: Person;
  locale: Locale;
  pendingLabel: string;
  photoPendingLabel: string;
  variant?: "onLight" | "onDark";
  className?: string;
  baseRotation?: number;
};

export default function PersonCard({
  person,
  locale,
  pendingLabel,
  photoPendingLabel,
  variant = "onLight",
  className = "",
  baseRotation = 0,
}: PersonCardProps) {
  const name = locale === "zh" ? person.name_zh : person.name_en;
  const role = locale === "zh" ? person.role_zh : person.role_en;
  const quote = locale === "zh" ? person.quote_zh : person.quote_en;
  // status:"pending" 原本只代表「還沒有真實照片」，但受訪與否是看 quote
  // 有沒有內容——兩者意義不同，訪談完成的人不該再顯示「訪談籌備中」。
  const hasQuote = Boolean(person.quote_zh || person.quote_en);
  const badgeLabel = hasQuote ? photoPendingLabel : pendingLabel;
  const nameFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const quoteFont = locale === "zh" ? "font-body-zh" : "font-body-en";
  const nameColor = variant === "onDark" ? "text-stone" : "text-ink";
  const quoteColor = variant === "onDark" ? "text-stone/70" : "text-ink/60";
  const { enabled: soundEnabled } = useSound();
  const prefersReducedMotion = useReducedMotion();

  const rotateVariants = prefersReducedMotion
    ? { rest: { rotate: 0 }, hover: { rotate: 0 } }
    : { rest: { rotate: baseRotation }, hover: { rotate: 0 } };
  const shadowVariants = prefersReducedMotion
    ? { rest: {}, hover: {} }
    : {
        rest: { boxShadow: "0 0px 0px 0px rgba(15,22,32,0)" },
        hover: { boxShadow: "0 24px 48px -12px rgba(15,22,32,0.45)" },
      };
  const scaleVariants = prefersReducedMotion
    ? { rest: { scale: 1 }, hover: { scale: 1 } }
    : { rest: { scale: 1 }, hover: { scale: 1.06 } };

  return (
    <MotionLink
      href={`/${locale}/people/${person.slug}`}
      className={`block outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      variants={rotateVariants}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      onHoverStart={() => soundEnabled && playHoverTick()}
      onFocus={() => soundEnabled && playHoverTick()}
    >
      <motion.div
        variants={shadowVariants}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[3/4] overflow-hidden bg-stone"
      >
        <motion.div
          variants={scaleVariants}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full"
        >
          <Image src={person.photo} alt={name} fill className="object-cover" />
        </motion.div>

        {person.status === "pending" && (
          <span className="font-body-en absolute left-3 top-3 bg-stone px-2 py-1 text-[10px] uppercase tracking-wide text-ink">
            {badgeLabel}
          </span>
        )}
      </motion.div>

      <div className="mt-4">
        {role && (
          <p className="font-body-en mb-1 text-[11px] uppercase tracking-widest text-accent">
            {role}
          </p>
        )}
        <p className={`${nameFont} ${nameColor} text-balance text-lg font-bold`}>
          {name}
        </p>
        {quote && (
          <p className={`${quoteFont} ${quoteColor} mt-1 line-clamp-2 text-sm`}>
            {quote}
          </p>
        )}
      </div>
    </MotionLink>
  );
}
