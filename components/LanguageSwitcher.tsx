"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const segments = pathname.split("/");

  return (
    <nav aria-label="Language" className="flex items-center gap-3">
      {locales.map((targetLocale) => {
        const targetSegments = [...segments];
        targetSegments[1] = targetLocale;
        const href = targetSegments.join("/") || "/";
        const isActive = targetLocale === locale;

        return (
          <Link
            key={targetLocale}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide transition-colors ${
              isActive ? "text-ink" : "text-ink/40 hover:text-accent"
            }`}
          >
            {targetLocale}
          </Link>
        );
      })}
    </nav>
  );
}
