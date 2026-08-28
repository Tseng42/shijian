import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getEcology } from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";
import RevealParagraphs from "@/components/RevealParagraphs";

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

  return (
    <main id="main-content" className="px-6 py-32 md:px-[10%] md:py-48">
      <h1
        className={`${headingFont} mb-20 max-w-4xl text-balance text-4xl font-bold leading-[1.15] md:mb-28 md:text-6xl`}
      >
        {title}
      </h1>

      <div className="space-y-24 md:space-y-32">
        {ecology.sections.map((section) => {
          const heading =
            locale === "zh" ? section.heading_zh : section.heading_en;
          const paragraphs =
            locale === "zh" ? section.paragraphs_zh : section.paragraphs_en;

          return (
            <section key={section.id} className="max-w-3xl">
              <h2
                className={`${headingFont} mb-6 text-balance text-2xl font-bold md:text-3xl`}
              >
                {heading}
              </h2>
              <RevealParagraphs
                paragraphs={paragraphs}
                className={`${bodyFont} text-lg leading-loose text-ink/80`}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}
