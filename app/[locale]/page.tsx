import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Hero from "@/components/Hero";

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);

  return (
    <main>
      <Hero scrollHint={dict.hero.scrollHint} />

      <section className="px-6 py-24 md:px-16">
        <p className="font-body-en max-w-md text-sm text-ink/50">
          Step 3 — Hero only. Story / People / Craft / Map / Legacy 將於下一階段依序建置。
        </p>
      </section>
    </main>
  );
}
