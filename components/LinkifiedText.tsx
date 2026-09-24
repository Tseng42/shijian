// 把字串裡的 http(s) 網址轉成可點連結，其餘文字原樣輸出。伺服器元件也能用。
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

export default function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("http://") || part.startsWith("https://") ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink/30 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
