import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPeople, getPersonBySlug } from "@/lib/content/people";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, type Locale } from "@/lib/i18n/config";
import PersonQuote from "@/components/PersonQuote";

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
  const role = locale === "zh" ? person.role_zh : person.role_en;
  const quote = locale === "zh" ? person.quote_zh : person.quote_en;
  const quoteMarked = quote && (locale === "zh" ? `「${quote}」` : `“${quote}”`);
  // status:"pending" 只代表還沒有真實照片；訪談完成與否要看 quote 有沒有內容。
  const hasQuote = Boolean(person.quote_zh || person.quote_en);
  const badgeLabel = hasQuote ? dict.people.photoPendingBadge : dict.people.pendingBadge;
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  const allPeople = getAllPeople();
  const currentIndex = allPeople.findIndex((p) => p.slug === slug);
  const prevPerson = allPeople[(currentIndex - 1 + allPeople.length) % allPeople.length];
  const nextPerson = allPeople[(currentIndex + 1) % allPeople.length];
  const prevName = locale === "zh" ? prevPerson.name_zh : prevPerson.name_en;
  const nextName = locale === "zh" ? nextPerson.name_zh : nextPerson.name_en;

  return (
    <main id="main-content" className="px-6 py-24 md:px-16 md:py-32">
      <Link
        href={`/${locale}/people`}
        className="font-body-en -ml-1 mb-12 inline-flex min-h-11 items-center px-1 text-sm text-ink/60 transition-colors hover:text-accent"
      >
        {dict.people.backToList}
      </Link>

      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone">
          <Image
            src={person.photo}
            alt={name}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div>
          {person.status === "pending" && (
            <span className="font-body-en mb-4 inline-block bg-ink px-2 py-1 text-[10px] uppercase tracking-wide text-stone">
              {badgeLabel}
            </span>
          )}

          {role && (
            <p className="font-body-en mb-2 text-xs uppercase tracking-widest text-accent">
              {role}
            </p>
          )}

          <h1 className={`${headingFont} mb-6 text-balance text-3xl font-bold md:text-4xl`}>
            {name}
          </h1>

          {quoteMarked && (
            <div className="mb-8 border-l-2 border-accent pl-6">
              <PersonQuote
                quote={quoteMarked}
                className={`${bodyFont} text-xl leading-relaxed text-ink/80`}
              />
            </div>
          )}

          {!hasQuote && (
            // TODO: 訪談完成後於此補上完整人物側寫內容
            <p className={`${bodyFont} text-sm text-ink/50`}>
              {dict.people.pendingDetail}
            </p>
          )}
        </div>
      </div>

      {allPeople.length > 1 && (
        <div className="mx-auto mt-20 flex max-w-4xl items-center justify-between border-t border-ink/10 pt-8">
          <Link
            href={`/${locale}/people/${prevPerson.slug}`}
            className="group flex min-h-11 max-w-[45%] flex-col items-start px-1"
          >
            <span className="font-body-en text-xs uppercase tracking-wide text-ink/40">
              {dict.people.prev}
            </span>
            <span className={`${headingFont} text-balance text-base font-bold text-ink transition-colors group-hover:text-accent`}>
              ← {prevName}
            </span>
          </Link>
          <Link
            href={`/${locale}/people/${nextPerson.slug}`}
            className="group flex min-h-11 max-w-[45%] flex-col items-end px-1 text-right"
          >
            <span className="font-body-en text-xs uppercase tracking-wide text-ink/40">
              {dict.people.next}
            </span>
            <span className={`${headingFont} text-balance text-base font-bold text-ink transition-colors group-hover:text-accent`}>
              {nextName} →
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}
