import type { LegacyContent } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

export default function Legacy({
  locale,
  content,
}: {
  locale: Locale;
  content: LegacyContent;
}) {
  const title = locale === "zh" ? content.title_zh : content.title_en;
  const paragraphs =
    locale === "zh" ? content.paragraphs_zh : content.paragraphs_en;
  const cta = locale === "zh" ? content.cta_zh : content.cta_en;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  return (
    <section className="px-6 py-24 md:px-[15%] md:py-32">
      <h2 className={`${headingFont} mb-8 text-2xl font-bold md:text-3xl`}>
        {title}
      </h2>
      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`${bodyFont} text-lg leading-loose text-ink/80`}
          >
            {paragraph}
          </p>
        ))}
      </div>
      {/* TODO: 保存行動／倡議連結待補，目前為佔位按鈕 */}
      <button
        type="button"
        className="font-body-en mt-10 rounded border border-ink px-5 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        {cta}
      </button>
    </section>
  );
}
