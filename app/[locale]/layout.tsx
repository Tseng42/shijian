import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SmoothScroll from "@/components/SmoothScroll";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
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
        <SmoothScroll>
          <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-16">
            {/* TODO: 替換為正式 Logo SVG，檔案將命名為 /public/logo.svg，單色墨色版本 */}
            <span className="font-heading-zh text-lg font-black">
              拾間{" "}
              <span className="font-heading-en text-sm font-normal italic">
                ShiJian
              </span>
            </span>
            <LanguageSwitcher locale={locale as Locale} />
          </header>

          {children}

          <footer className="border-t border-ink/10 px-6 py-8 font-body-en text-xs text-ink/50 md:px-16">
            {dict.footer.copyright}
          </footer>
        </SmoothScroll>
      </body>
    </html>
  );
}
