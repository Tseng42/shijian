import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getAllPeople } from "@/lib/content/people";

import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const people = getAllPeople();
  const paths = [
    "",
    "/people",
    "/history",
    "/ecology",
    "/atlas",
    "/experience",
    "/about",
    ...people.map((p) => `/people/${p.slug}`),
  ];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
    }))
  );
}
