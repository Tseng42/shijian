"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Person } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/config";
import { useSound } from "./SoundProvider";
import { playHoverTick } from "@/lib/sound";

const MotionLink = motion(Link);

type PersonCardProps = {
  person: Person;
  locale: Locale;
  pendingLabel: string;
  variant?: "onLight" | "onDark";
  className?: string;
  baseRotation?: number;
};

export default function PersonCard({
  person,
  locale,
  pendingLabel,
  variant = "onLight",
  className = "",
  baseRotation = 0,
}: PersonCardProps) {
  const name = locale === "zh" ? person.name_zh : person.name_en;
  const quote = locale === "zh" ? person.quote_zh : person.quote_en;
  const nameFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const quoteFont = locale === "zh" ? "font-body-zh" : "font-body-en";
  const nameColor = variant === "onDark" ? "text-stone" : "text-ink";
  const quoteColor = variant === "onDark" ? "text-stone/70" : "text-ink/60";
  const { enabled: soundEnabled } = useSound();

  return (
    <MotionLink
      href={`/${locale}/people/${person.slug}`}
      className={`block outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      variants={{ rest: { rotate: baseRotation }, hover: { rotate: 0 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      onHoverStart={() => soundEnabled && playHoverTick()}
      onFocus={() => soundEnabled && playHoverTick()}
    >
      <motion.div
        variants={{
          rest: { boxShadow: "0 0px 0px 0px rgba(27,26,23,0)" },
          hover: { boxShadow: "0 24px 48px -12px rgba(27,26,23,0.45)" },
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[3/4] overflow-hidden bg-stone"
      >
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full"
        >
          <Image src={person.photo} alt={name} fill className="object-cover" />
        </motion.div>

        {person.status === "pending" && (
          <span className="font-body-en absolute left-3 top-3 bg-stone px-2 py-1 text-[10px] uppercase tracking-wide text-ink">
            {pendingLabel}
          </span>
        )}
      </motion.div>

      <div className="mt-4">
        <p className={`${nameFont} ${nameColor} text-balance text-lg font-bold`}>
          {name}
        </p>
        <p className={`${quoteFont} ${quoteColor} mt-1 line-clamp-2 text-sm`}>
          {quote}
        </p>
      </div>
    </MotionLink>
  );
}
