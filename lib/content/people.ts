import fs from "node:fs";
import path from "node:path";

export type Person = {
  slug: string;
  name_zh: string;
  name_en: string;
  quote_zh: string;
  quote_en: string;
  photo: string;
  status: "published" | "pending";
};

const PEOPLE_DIR = path.join(process.cwd(), "content", "people");

export function getAllPeople(): Person[] {
  const files = fs
    .readdirSync(PEOPLE_DIR)
    .filter((file) => file.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(PEOPLE_DIR, file), "utf-8");
      return JSON.parse(raw) as Person;
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getPersonBySlug(slug: string): Person | undefined {
  return getAllPeople().find((person) => person.slug === slug);
}
