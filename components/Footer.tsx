import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <footer className="border-t border-ink/10 px-6 py-10 md:px-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link
          href={`/${locale}/about`}
          className="font-body-en text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {dict.footer.aboutLink}
        </Link>
        <LanguageSwitcher locale={locale} />
      </div>
      <p className="font-body-en mt-6 text-xs text-ink/40">
        {dict.footer.copyright}
      </p>
    </footer>
  );
}
