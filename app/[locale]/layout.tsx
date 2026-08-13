import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import { SoundProvider } from "@/components/SoundProvider";
import BackgroundTexture from "@/components/BackgroundTexture";
import PageTransition from "@/components/PageTransition";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { zh: "/zh", en: "/en" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === "zh" ? "zh_TW" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <html
      lang={locale === "zh" ? "zh-Hant" : "en"}
      className={`${notoSansTC.variable} ${notoSerifTC.variable} ${fraunces.variable} ${inter.variable}`}
    >
      <body className="bg-stone text-ink antialiased">
        <BackgroundTexture />
        <PageTransition />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-stone"
        >
          {dict.a11y.skipToContent}
        </a>
        <SoundProvider>
        <SmoothScroll>
          <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-16">
            {/* TODO: 替換為正式 Logo SVG，檔案將命名為 /public/logo.svg，單色墨色版本 */}
            <Link
              href={`/${locale}`}
              translate="no"
              className="font-heading-zh text-lg font-black transition-colors hover:text-accent"
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
              <Link
                href={`/${locale}`}
                className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:text-accent"
              >
                {dict.nav.home}
              </Link>
              <Link
                href={`/${locale}/people`}
                className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:text-accent"
              >
                {dict.nav.people}
              </Link>
              <Link
                href={`/${locale}/history`}
                className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:text-accent"
              >
                {dict.nav.history}
              </Link>
              <Link
                href={`/${locale}/ecology`}
                className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:text-accent"
              >
                {dict.nav.ecology}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:text-accent"
              >
                {dict.nav.about}
              </Link>
              <Link
                href={`/${locale}/experience`}
                className="font-body-en inline-flex min-h-11 items-center rounded-full border border-ink/30 px-4 text-sm uppercase tracking-wide text-ink/70 transition-colors hover:border-accent hover:text-accent"
              >
                {dict.nav.experience}
              </Link>
            </nav>
          </header>

          {children}

          <Footer locale={locale as Locale} dict={dict} />
        </SmoothScroll>
        </SoundProvider>
      </body>
    </html>
  );
}
