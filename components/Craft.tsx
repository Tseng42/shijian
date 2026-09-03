"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/flow-scroll";
import type { CraftContent } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

// 七泡七曬的真實色階（跟 TideProgress 用的是同一組資料），只在「泡曬」這個
// 步驟出現——顏色本身就是那道工序的紀錄，不是隨手挑的裝飾漸層。
const SUN_DRY_COLORS = [
  "#4A2E28",
  "#7A3F2E",
  "#A66B3E",
  "#C79447",
  "#DDB662",
  "#EAD08C",
  "#F5EDD6",
];

// 備裝、判潮、泡曬、敲打都是在岸上做的，五個步驟裡只有「採集」是真的下水——
// 讓它單獨用強調色跳出來，其餘四步全部維持淺色，對比落在唯一有意義的地方，
// 不是輪流展示三個色票。
const STEP_TONE: Array<"stone" | "ink" | "accent"> = [
  "stone",
  "stone",
  "accent",
  "stone",
  "stone",
];

export default function Craft({
  locale,
  content,
  eyebrow,
  experienceCta,
}: {
  locale: Locale;
  content: CraftContent;
  eyebrow: string;
  experienceCta: string;
}) {
  const title = locale === "zh" ? content.title_zh : content.title_en;
  const intro = locale === "zh" ? content.intro_zh : content.intro_en;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  return (
    <div>
      <FlowArt aria-label={title}>
        <FlowSection aria-label={title} className="bg-ink text-stone">
          <p className="font-body-en text-xs uppercase tracking-[0.3em] text-stone/50">
            {eyebrow}
          </p>
          <h2
            className={`${headingFont} max-w-3xl text-balance text-5xl font-bold leading-[1.1] md:text-8xl`}
          >
            {title}
          </h2>
          <p className={`${bodyFont} max-w-xl text-lg leading-loose text-stone/75 md:text-xl`}>
            {intro}
          </p>
        </FlowSection>

        {content.steps.map((step, index) => {
          const label = locale === "zh" ? step.label_zh : step.label_en;
          const text = locale === "zh" ? step.text_zh : step.text_en;
          const tone = STEP_TONE[index] ?? "stone";
          const isSunDry = step.key === "process";

          const toneClass =
            tone === "ink"
              ? "bg-ink text-stone"
              : tone === "accent"
                ? "bg-accent text-stone"
                : "bg-stone text-ink";
          const mutedClass = tone === "stone" ? "text-ink/60" : "text-stone/70";
          const numberClass = tone === "stone" ? "text-ink/30" : "text-stone/40";

          return (
            <FlowSection key={step.key} aria-label={label} className={toneClass}>
              <p
                className={`font-body-en tabular-nums text-xs uppercase tracking-[0.3em] ${numberClass}`}
              >
                {String(index + 1).padStart(2, "0")} / {String(content.steps.length).padStart(2, "0")}
              </p>
              <h3
                className={`${headingFont} max-w-3xl text-balance text-5xl font-bold leading-[1.1] md:text-8xl`}
              >
                {label}
              </h3>
              <p className={`${bodyFont} max-w-2xl text-base leading-relaxed md:text-lg ${mutedClass}`}>
                {text}
              </p>

              {isSunDry && (
                <div
                  aria-hidden="true"
                  className="mt-4 h-3 w-full max-w-2xl md:h-4"
                  style={{
                    background: `linear-gradient(90deg, ${SUN_DRY_COLORS.join(", ")})`,
                  }}
                />
              )}
            </FlowSection>
          );
        })}
      </FlowArt>

      <div className="bg-stone px-6 py-16 text-ink md:px-[10%]">
        <Link
          href={`/${locale}/experience`}
          className="font-body-en inline-flex min-h-11 w-fit items-center px-1 text-lg underline decoration-ink/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {experienceCta}
        </Link>
      </div>
    </div>
  );
}
