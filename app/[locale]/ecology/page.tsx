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
    <main id="main-content" className="px-6 py-24 md:px-[15%] md:py-32">
      <h1
        className={`${headingFont} mb-16 text-balance text-3xl font-bold md:text-5xl`}
      >
        {title}
      </h1>

      <div className="space-y-16">
        {ecology.sections.map((section) => {
          const heading =
            locale === "zh" ? section.heading_zh : section.heading_en;
          const paragraphs =
            locale === "zh" ? section.paragraphs_zh : section.paragraphs_en;

          return (
            <section key={section.id}>
              <h2
                className={`${headingFont} mb-4 text-balance text-xl font-bold md:text-2xl`}
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
