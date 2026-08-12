import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPeople, getPersonBySlug } from "@/lib/content/people";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  const people = getAllPeople();
  return locales.flatMap((locale) =>
    people.map((person) => ({ locale, slug: person.slug }))
  );
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const person = getPersonBySlug(slug);
  if (!person) return {};
  const dict = await getDictionary(locale);
  const name = locale === "zh" ? person.name_zh : person.name_en;
  return { title: `${name} — ${dict.meta.title}` };
}

export default async function PersonPage({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string };
}) {
  const person = getPersonBySlug(slug);
  if (!person) notFound();

  const dict = await getDictionary(locale);
  const name = locale === "zh" ? person.name_zh : person.name_en;
  const quote = locale === "zh" ? person.quote_zh : person.quote_en;
  const quoteMarked = locale === "zh" ? `「${quote}」` : `“${quote}”`;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  return (
    <main className="px-6 py-24 md:px-16 md:py-32">
      <Link
        href={`/${locale}/people`}
        className="font-body-en mb-12 inline-block text-sm text-ink/60 transition-colors hover:text-accent"
      >
        {dict.people.backToList}
      </Link>

      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone">
          {/* TODO: 補充有意義的 alt 文字 */}
          <Image
            src={person.photo}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>

        <div>
          {person.status === "pending" && (
            <span className="font-body-en mb-4 inline-block bg-ink px-2 py-1 text-[10px] uppercase tracking-wide text-stone">
              {dict.people.pendingBadge}
            </span>
          )}

          <h1 className={`${headingFont} mb-6 text-3xl font-bold md:text-4xl`}>
            {name}
          </h1>

          <p
            className={`${bodyFont} mb-8 text-xl leading-relaxed text-ink/80`}
          >
            {quoteMarked}
          </p>

          {person.status === "pending" && (
            // TODO: 訪談完成後於此補上完整人物側寫內容
            <p className={`${bodyFont} text-sm text-ink/50`}>
              {dict.people.pendingDetail}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
