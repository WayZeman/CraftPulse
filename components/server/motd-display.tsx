import { parseMotd } from "@/lib/utils";

export function MotdDisplay({ motd }: { motd: string | null | undefined }) {
  if (!motd) return null;
  const lines = parseMotd(motd);
  return (
    <pre className="overflow-x-auto rounded-lg border border-border/60 bg-black/40 p-4 font-mono text-sm leading-relaxed">
      {lines.map((tokens, lineIdx) => (
        <div key={lineIdx}>
          {tokens.map((t, i) => (
            <span
              key={i}
              style={{
                color: t.color ?? undefined,
                fontWeight: t.bold ? 700 : undefined,
                fontStyle: t.italic ? "italic" : undefined,
                textDecoration: t.underline ? "underline" : undefined,
              }}
            >
              {t.text}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}
