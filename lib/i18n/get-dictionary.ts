import type { Locale } from "./config";
import zh from "@/content/dictionaries/zh.json";
import en from "@/content/dictionaries/en.json";

const dictionaries = { zh, en } as const;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type Dictionary = (typeof dictionaries)[Locale];
