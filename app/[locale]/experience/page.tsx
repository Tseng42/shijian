import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import ExperienceForm from "@/components/ExperienceForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return { title: `${dict.experience.title} — ${dict.meta.title}` };
}

export default async function ExperiencePage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);
  const headingFont = locale === "zh" ? "font-heading-zh" : "font-heading-en";
  const bodyFont = locale === "zh" ? "font-body-zh" : "font-body-en";

  return (
    <main id="main-content" className="px-6 py-24 md:px-[15%] md:py-32">
      <h1
        className={`${headingFont} mb-6 text-balance text-3xl font-bold md:text-5xl`}
      >
        {dict.experience.title}
      </h1>
      <p
        className={`${bodyFont} mb-12 max-w-xl text-lg leading-loose text-ink/80`}
      >
        {dict.experience.intro}
      </p>

      <ExperienceForm
        labels={{
          name: dict.experience.formName,
          email: dict.experience.formEmail,
          timeframe: dict.experience.formTimeframe,
          timeframePlaceholder: dict.experience.formTimeframePlaceholder,
          message: dict.experience.formMessage,
          submit: dict.experience.formSubmit,
          submitting: dict.experience.formSubmitting,
          success: dict.experience.formSuccess,
          error: dict.experience.formError,
          notConfigured: dict.experience.notConfigured,
        }}
      />
    </main>
  );
}
