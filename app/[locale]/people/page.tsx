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

  // 每張照片給一點固定的旋轉角度與垂直位移，像散放在桌上的沖印照片，
  // 不是精準對齊的網格——用 index 決定角度，避免每次 render 都不一樣。
  const rotations = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9];

  return (
    <main id="main-content" className="px-6 py-32 md:px-[10%] md:py-48">
      <h1
        className={`${headingFont} mb-24 max-w-3xl text-balance text-4xl font-bold leading-[1.15] md:mb-32 md:text-6xl`}
      >
        {dict.people.eyebrow}
      </h1>

      <div className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person, index) => (
          <div
            key={person.slug}
            className={index % 3 === 1 ? "sm:mt-12" : undefined}
          >
            <PersonCard
              person={person}
              locale={locale}
              pendingLabel={dict.people.pendingBadge}
              baseRotation={rotations[index % rotations.length]}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
