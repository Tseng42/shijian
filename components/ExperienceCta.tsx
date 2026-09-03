"use client";

import Link from "next/link";
import { usePressFeedback } from "@/lib/hooks/use-press-feedback";

export default function ExperienceCta({
  locale,
  label,
  variant = "onLight",
}: {
  locale: string;
  label: string;
  variant?: "onLight" | "onDark";
}) {
  const { pressed, handlers } = usePressFeedback();
  const restBorder = variant === "onDark" ? "border-stone/40" : "border-ink/30";
  const restText = variant === "onDark" ? "text-stone/80" : "text-ink/70";

  return (
    <Link
      href={`/${locale}/experience`}
      {...handlers}
      className={`font-body-en inline-flex min-h-11 items-center rounded-full border px-4 text-sm uppercase tracking-wide transition-[color,border-color,border-width,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-accent hover:text-accent active:scale-[0.94] active:border-[3px] active:border-accent active:text-accent ${
        pressed
          ? "scale-[0.94] border-[3px] border-accent text-accent"
          : `${restBorder} ${restText}`
      }`}
    >
      {label}
    </Link>
  );
}
