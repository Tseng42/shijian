import type { LegacyContent } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";
import TextReveal from "@/components/ui/text-reveal";

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
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";

  return (
    <section className="px-6 py-32 md:px-[10%] md:py-48">
      <h2 className={`${headingFont} mb-8 max-w-3xl text-balance text-2xl font-bold md:text-3xl`}>
        {title}
      </h2>
      {paragraphs.map((paragraph, i) => (
        <TextReveal
          key={i}
          text={paragraph}
          locale={locale}
          fontClassName={headingFont}
        />
      ))}
    </section>
  );
}
