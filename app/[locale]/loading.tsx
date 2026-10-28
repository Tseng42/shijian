import GelidiumSprig from "@/components/GelidiumSprig";

// 等待的時候，一叢石花菜從底部慢慢長出來，取代原本閃爍的文字。
export default function Loading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <GelidiumSprig className="h-40 w-auto md:h-52" />
      <p className="font-body-en text-xs uppercase tracking-widest text-ink/40">
        Loading…・載入中…
      </p>
    </main>
  );
}
