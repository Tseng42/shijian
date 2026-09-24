import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getEcology } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";
import RevealParagraphs from "@/components/RevealParagraphs";
import SectionNav from "@/components/SectionNav";
import SeasonalTimeline from "@/components/SeasonalTimeline";
import { keepNumberUnitTogether } from "@/lib/utils";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const ecology = getEcology();
  const title = locale === "zh" ? ecology.title_zh : ecology.title_en;
  return { title: `${title} — ${dict.meta.title}` };
}

export default async function EcologyPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const ecology = getEcology();
  const title = locale === "zh" ? ecology.title_zh : ecology.title_en;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  const navSections = ecology.sections.map((section) => ({
    id: section.id,
    label: locale === "zh" ? section.heading_zh : section.heading_en,
  }));

  return (
    <main id="main-content" className="px-6 py-32 md:px-[10%] md:py-48">
      <h1
        className={`${headingFont} mb-20 max-w-4xl text-balance text-4xl font-bold leading-[1.15] md:mb-28 md:text-6xl`}
      >
        {title}
      </h1>

      <div className="grid grid-cols-1 gap-x-16 xl:grid-cols-[1fr_10rem]">
        <div className="space-y-28 md:space-y-36">
          {ecology.sections.map((section, index) => {
            const heading =
              locale === "zh" ? section.heading_zh : section.heading_en;
            const paragraphs =
              locale === "zh" ? section.paragraphs_zh : section.paragraphs_en;
            const quote = locale === "zh" ? section.quote_zh : section.quote_en;
            const quoteAttribution =
              locale === "zh"
                ? section.quoteAttribution_zh
                : section.quoteAttribution_en;

            return (
              <section
                key={section.id}
                id={section.id}
                className="max-w-3xl scroll-mt-32"
              >
                <p className="font-body-en mb-3 text-sm tracking-widest text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2
                  className={`${headingFont} mb-8 text-balance text-2xl font-bold md:text-3xl`}
                >
                  {heading}
                </h2>
                <RevealParagraphs
                  paragraphs={paragraphs}
                  className={`${bodyFont} text-lg leading-loose text-ink/80`}
                />

                {section.timeline && (
                  <SeasonalTimeline entries={section.timeline} locale={locale} />
                )}

                {quote && (
                  <div className="mt-8 border-l-2 border-accent pl-6">
                    <p className={`${bodyFont} text-xl leading-relaxed text-ink/80`}>
                      {locale === "zh" ? `「${quote}」` : `“${quote}”`}
                    </p>
                    {quoteAttribution && (
                      <p className="font-body-en mt-3 text-xs uppercase tracking-widest text-ink/40">
                        {keepNumberUnitTogether(quoteAttribution)}
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <SectionNav sections={navSections} />
      </div>
    </main>
  );
}
