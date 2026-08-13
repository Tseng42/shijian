import fs from "node:fs";
import path from "node:path";

export type StoryContent = {
  title_zh: string;
  title_en: string;
  paragraphs_zh: string[];
  paragraphs_en: string[];
};

export type CraftStep = {
  key: string;
  label_zh: string;
  label_en: string;
  text_zh: string;
  text_en: string;
};

export type CraftContent = {
  title_zh: string;
  title_en: string;
  intro_zh: string;
  intro_en: string;
  steps: CraftStep[];
};

export type Location = {
  id: string;
  name_zh: string;
  name_en: string;
  x: number;
  y: number;
};

export type LegacyContent = {
  title_zh: string;
  title_en: string;
  paragraphs_zh: string[];
  paragraphs_en: string[];
  cta_zh: string;
  cta_en: string;
};

export type AboutSection = {
  id: string;
  heading_zh: string;
  heading_en: string;
  paragraphs_zh: string[];
  paragraphs_en: string[];
  list_zh?: string[];
  list_en?: string[];
};

export type AboutContent = {
  title_zh: string;
  title_en: string;
  sections: AboutSection[];
};

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(fileName: string): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf-8");
  return JSON.parse(raw) as T;
}

export function getStory(): StoryContent {
  return readJson<StoryContent>("story.json");
}

export function getCraft(): CraftContent {
  return readJson<CraftContent>("craft.json");
}

export function getLocations(): Location[] {
  return readJson<Location[]>("locations.json");
}

export function getLegacy(): LegacyContent {
  return readJson<LegacyContent>("legacy.json");
}

export function getAbout(): AboutContent {
  return readJson<AboutContent>("about.json");
}

export function getHistory(): AboutContent {
  return readJson<AboutContent>("history.json");
}

export function getEcology(): AboutContent {
  return readJson<AboutContent>("ecology.json");
}
