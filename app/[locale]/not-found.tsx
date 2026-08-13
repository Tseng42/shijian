import Link from "next/link";

// Next.js 的 not-found.tsx 不會拿到 locale 參數，因此中英文並列顯示。
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p className="font-body-en text-xs uppercase tracking-widest text-ink/50">
        404
      </p>
      <h1 className="font-heading-zh text-3xl font-bold md:text-4xl">
        找不到頁面
      </h1>
      <p className="font-heading-en text-lg italic text-ink/70">
        Page not found
      </p>
      <div className="mt-4 flex gap-6">
        <Link
          href="/zh"
          className="font-body-en inline-flex min-h-11 items-center text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          回首頁
        </Link>
        <Link
          href="/en"
          className="font-body-en inline-flex min-h-11 items-center text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
