import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAllPeople } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/config";
import PersonCard from "@/components/PersonCard";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return { title: `${dict.people.eyebrow} — ${dict.meta.title}` };
}

export default async function PeopleListPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);
  const people = getAllPeople();
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";

  return (
    <main className="px-6 py-24 md:px-16 md:py-32">
      <h1 className={`${headingFont} mb-16 text-3xl font-bold md:text-5xl`}>
        {dict.people.eyebrow}
      </h1>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <PersonCard
            key={person.slug}
            person={person}
            locale={locale}
            pendingLabel={dict.people.pendingBadge}
          />
        ))}
      </div>
    </main>
  );
}
