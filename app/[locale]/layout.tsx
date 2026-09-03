import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import { SoundProvider } from "@/components/SoundProvider";
import BackgroundTexture from "@/components/BackgroundTexture";
import TideProgress from "@/components/TideProgress";
import SiteHeader from "@/components/SiteHeader";

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

export const viewport: Viewport = {
  themeColor: "#F0F3F2",
};

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
        <TideProgress />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-stone"
        >
          {dict.a11y.skipToContent}
        </a>
        <SoundProvider>
        <SmoothScroll>
          <SiteHeader locale={locale as Locale} dict={dict} />

          {children}

          <Footer locale={locale as Locale} dict={dict} />
        </SmoothScroll>
        </SoundProvider>
      </body>
    </html>
  );
}
