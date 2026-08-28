"use client";

import { useState } from "react";
import { usePressFeedback } from "@/lib/hooks/use-press-feedback";

type Status = "idle" | "submitting" | "success" | "error";

type Labels = {
  name: string;
  email: string;
  timeframe: string;
  timeframePlaceholder: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  notConfigured: string;
};

const inputClass =
  "w-full border-b border-ink/20 bg-transparent py-2 font-body-en text-ink caret-accent outline-none transition-colors focus-visible:border-accent";
const labelClass = "font-body-en mb-1 block text-xs uppercase tracking-wide text-ink/50";

export default function ExperienceForm({ labels }: { labels: Labels }) {
  const [status, setStatus] = useState<Status>("idle");
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  const { pressed, handlers } = usePressFeedback();

  if (!formId) {
    return <p className="text-sm text-ink/50">{labels.notConfigured}</p>;
  }

  if (status === "success") {
    return (
      <p role="status" className="text-lg text-ink/80">
        {labels.success}
      </p>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          {labels.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="timeframe" className={labelClass}>
          {labels.timeframe}
        </label>
        <input
          id="timeframe"
          name="timeframe"
          type="text"
          placeholder={labels.timeframePlaceholder}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>
          {labels.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 border-l-2 border-ink/40 pl-3 text-sm text-ink/80"
        >
          <span aria-hidden="true">⚠</span>
          {labels.error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        {...handlers}
        className={`font-body-en inline-flex items-center gap-2 rounded border px-5 py-2 text-sm transition-[color,border-color,border-width,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-accent hover:text-accent disabled:opacity-50 active:scale-[0.94] active:border-2 active:border-accent active:text-accent ${
          pressed ? "scale-[0.94] border-2 border-accent text-accent" : "border-ink"
        }`}
      >
        {status === "submitting" && (
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />
            <path
              d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
        {status === "submitting" ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
