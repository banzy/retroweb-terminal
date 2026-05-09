import { useEffect, useState } from "react";
import type { Quote } from "@/lib/quotes";

const PHRASE = "wake up, neo...";
const CHAR_DELAY = 90;
const CURSOR_PAUSE = 2000;
const POST_TYPE_PAUSE = 1200;

type Phase = "cursor" | "typing" | "pause" | "quote";

type Props = {
  quote: Quote;
  children?: React.ReactNode;
};

export function MatrixSequence({ quote, children }: Props) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [displayed, setDisplayed] = useState("");

  // Cursor pause → start typing
  useEffect(() => {
    if (phase !== "cursor") return;
    const t = window.setTimeout(() => setPhase("typing"), CURSOR_PAUSE);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== "typing") return;
    if (displayed.length >= PHRASE.length) {
      setPhase("pause");
      return;
    }
    const t = window.setTimeout(
      () => setDisplayed(PHRASE.slice(0, displayed.length + 1)),
      CHAR_DELAY,
    );
    return () => window.clearTimeout(t);
  }, [phase, displayed]);

  // Brief pause after typing → show quote
  useEffect(() => {
    if (phase !== "pause") return;
    const t = window.setTimeout(() => setPhase("quote"), POST_TYPE_PAUSE);
    return () => window.clearTimeout(t);
  }, [phase]);

  const quoteBlock = [
    "",
    `"${quote.quote}"`,
    "",
    `  -- ${quote.author.toUpperCase()}${quote.tags.length ? `  [${quote.tags.join(", ")}]` : ""}`,
  ].join("\n");

  return (
    <div
      className="absolute inset-0 z-[50] overflow-hidden"
      style={{ background: "var(--effective-bg, var(--crt-bg))" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 crt-text text-[var(--phosphor)] text-sm font-mono whitespace-pre">
        {phase === "cursor" && (
          <div className="crt-cursor crt-text text-[var(--phosphor)]">&nbsp;</div>
        )}

        {(phase === "typing" || phase === "pause") && (
          <div>
            {displayed}
            <span className="crt-cursor">&nbsp;</span>
          </div>
        )}

        {phase === "quote" && (
          <>
            <div>{PHRASE}</div>
            <pre className="matrix-quote-in ascii-pre text-[var(--phosphor-dim)] whitespace-pre-wrap mt-0">
              {quoteBlock}
            </pre>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-3 sm:px-6 pb-6">
        <div className="flex items-center justify-end mb-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("w1975:reboot"))}
            className="crt-text text-[var(--phosphor-dim)] hover:text-[var(--phosphor)] font-mono text-xs underline underline-offset-2"
          >
            [ REBOOT ]
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
