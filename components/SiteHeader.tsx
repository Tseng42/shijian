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

  // TODO: 替換為正式 Logo SVG，檔案將命名為 /public/logo.svg，單色墨色版本
  const logo = (
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
  );

  return (
    <header
      className={cn(
        "z-20 px-6 py-4 md:px-16",
        isHome ? "absolute inset-x-0 top-0" : "relative",
      )}
    >
      {/* 手機：logo 靠左、選單＋按鈕靠右，維持原本排列，不受下方置中版型影響 */}
      <div className="flex items-center justify-between md:hidden">
        {logo}
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
      </div>

      {/* 桌機：logo 置中、選單對稱分兩側夾住 logo——2026 質感／得獎網站常見的
          agency-style 排版（見 Awwwards 搜尋結果），取代原本 logo 左、選單右的split版 */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <nav aria-label="Primary" className="flex items-center justify-end gap-x-6">
          <Link href={`/${locale}`} className={linkClass}>
            {dict.nav.home}
          </Link>
          <Link href={`/${locale}/people`} className={linkClass}>
            {dict.nav.people}
          </Link>
        </nav>

        <div className="justify-self-center">{logo}</div>

        <div className="flex items-center justify-self-end gap-x-6">
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
        </div>
      </div>
    </header>
  );
}
