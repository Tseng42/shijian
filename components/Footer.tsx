import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import SoundToggle from "./SoundToggle";
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
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/about`}
            className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {dict.footer.aboutLink}
          </Link>
          <Link
            href={`/${locale}/atlas`}
            className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {dict.footer.atlasLink}
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <SoundToggle onLabel={dict.sound.on} offLabel={dict.sound.off} />
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
      <p className="font-body-en mt-6 text-xs text-ink/40">
        {dict.footer.copyright}
      </p>
    </footer>
  );
}
