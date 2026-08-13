"use client";

import { useSound } from "./SoundProvider";

export default function SoundToggle({
  onLabel,
  offLabel,
}: {
  onLabel: string;
  offLabel: string;
}) {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="font-body-en -my-2.5 inline-flex min-h-11 items-center py-2.5 text-sm text-ink/40 transition-colors hover:text-accent"
    >
      {enabled ? onLabel : offLabel}
    </button>
  );
}
