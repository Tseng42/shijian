import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  getStory,
  getCraft,
  getLegacy,
  getHistory,
  getEcology,
} from "@/lib/content/sections";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return { title: `${dict.atlas.title} — ${dict.meta.title}` };
}

export default async function AtlasPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);
  const story = getStory();
  const craft = getCraft();
  const legacy = getLegacy();
  const history = getHistory();
  const ecology = getEcology();
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";
  const t = (zh: string, en: string) => (locale === "zh" ? zh : en);

  const entries = [
    {
      href: `/${locale}`,
      title: dict.nav.home,
      subitems: [
        t(story.title_zh, story.title_en),
        dict.people.eyebrow,
        t(craft.title_zh, craft.title_en),
        dict.map.eyebrow,
        t(legacy.title_zh, legacy.title_en),
      ],
    },
    { href: `/${locale}/people`, title: dict.nav.people, subitems: [] },
    {
      href: `/${locale}/history`,
      title: dict.nav.history,
      subitems: history.sections.map((s) => t(s.heading_zh, s.heading_en)),
    },
    {
      href: `/${locale}/ecology`,
      title: dict.nav.ecology,
      subitems: ecology.sections.map((s) => t(s.heading_zh, s.heading_en)),
    },
    {
      href: `/${locale}/experience`,
      title: dict.craft.experienceCta,
      subitems: [],
    },
    { href: `/${locale}/about`, title: dict.nav.about, subitems: [] },
  ];

  return (
    <main id="main-content" className="px-6 py-32 md:px-[10%] md:py-48">
      <h1
        className={`${headingFont} mb-6 max-w-4xl text-balance text-4xl font-bold leading-[1.15] md:text-6xl`}
      >
        {dict.atlas.title}
      </h1>
      <p className={`${bodyFont} mb-20 max-w-xl text-ink/70 md:mb-28`}>
        {dict.atlas.intro}
      </p>

      <ol className="divide-y divide-ink/10 border-t border-ink/10">
        {entries.map((entry, index) => (
          <li key={entry.href} className="py-8">
            <Link
              href={entry.href}
              className="group flex items-baseline gap-6"
            >
              <span className="font-heading-en text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`${headingFont} text-balance text-2xl font-bold transition-colors group-hover:text-accent md:text-3xl`}
              >
                {entry.title}
              </span>
            </Link>
            {entry.subitems.length > 0 && (
              <p className={`${bodyFont} mt-2 pl-14 text-sm text-ink/50`}>
                {entry.subitems.join(" ・ ")}
              </p>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
