import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { getAllPeople } from "@/lib/content/people";
import {
  getStory,
  getCraft,
  getLocations,
  getLegacy,
} from "@/lib/content/sections";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import PeopleTeaser from "@/components/PeopleTeaser";
import Craft from "@/components/Craft";
import MapSection from "@/components/MapSection";
import Legacy from "@/components/Legacy";

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);
  const people = getAllPeople();
  const story = getStory();
  const craft = getCraft();
  const locations = getLocations();
  const legacy = getLegacy();

  const storyTitle = locale === "zh" ? story.title_zh : story.title_en;
  const storyParagraphs =
    locale === "zh" ? story.paragraphs_zh : story.paragraphs_en;

  return (
    <main>
      <Hero scrollHint={dict.hero.scrollHint} />

      <Story locale={locale} title={storyTitle} paragraphs={storyParagraphs} />

      <PeopleTeaser
        locale={locale}
        people={people}
        eyebrow={dict.people.eyebrow}
        viewAllLabel={dict.people.viewAll}
        pendingLabel={dict.people.pendingBadge}
      />

      <Craft locale={locale} content={craft} />

      <MapSection
        locale={locale}
        locations={locations}
        eyebrow={dict.map.eyebrow}
      />

      <Legacy locale={locale} content={legacy} />
    </main>
  );
}
