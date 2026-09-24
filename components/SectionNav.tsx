"use client";

import { useEffect, useState } from "react";

type SectionNavProps = {
  sections: { id: string; label: string }[];
};

// 桌機版側邊目錄，用 IntersectionObserver 追蹤目前捲動到哪一節，
// 不用額外套件；手機版直接隱藏，避免長頁面被目錄佔掉太多空間。
export default function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-32 hidden self-start xl:block"
    >
      <ul className="space-y-3 border-l border-ink/10 pl-4">
        {sections.map(({ id, label }, index) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className={`font-body-en flex items-baseline gap-2 py-1 text-xs uppercase tracking-wide transition-colors ${
                  isActive ? "text-accent" : "text-ink/40 hover:text-ink/70"
                }`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="max-w-[9rem] text-balance">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
