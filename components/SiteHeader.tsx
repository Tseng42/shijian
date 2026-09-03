"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import ExperienceCta from "./ExperienceCta";
import { cn } from "@/lib/utils";

// Only the homepage opens on Hero's full-bleed dark photo — everywhere else
// starts directly on stone-background content, where light nav text would be
// unreadable. So the transparent-overlay treatment is homepage-only; every
// other route keeps the header in normal flow with its own stone backdrop.
export default function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;

  const linkClass = cn(
    "font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide transition-colors hover:text-accent",
    isHome ? "text-stone/80" : "text-ink/70",
  );

  return (
    <header
      className={cn(
        "z-20 flex items-center justify-between px-6 py-4 md:px-16",
        isHome ? "absolute inset-x-0 top-0" : "relative",
      )}
    >
      {/* TODO: 替換為正式 Logo SVG，檔案將命名為 /public/logo.svg，單色墨色版本 */}
      <Link
        href={`/${locale}`}
        translate="no"
        className={cn(
          "font-heading-zh text-lg font-black transition-colors hover:text-accent",
          isHome ? "text-stone" : "text-ink",
        )}
      >
        拾間{" "}
        <span className="font-heading-en text-sm font-normal italic">
          ShiJian
        </span>
      </Link>
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1"
      >
        <Link href={`/${locale}`} className={linkClass}>
          {dict.nav.home}
        </Link>
        <Link href={`/${locale}/people`} className={linkClass}>
          {dict.nav.people}
        </Link>
        <Link href={`/${locale}/history`} className={linkClass}>
          {dict.nav.history}
        </Link>
        <Link href={`/${locale}/ecology`} className={linkClass}>
          {dict.nav.ecology}
        </Link>
        <Link href={`/${locale}/about`} className={linkClass}>
          {dict.nav.about}
        </Link>
        <ExperienceCta
          locale={locale}
          label={dict.nav.experience}
          variant={isHome ? "onDark" : "onLight"}
        />
      </nav>
    </header>
  );
}
