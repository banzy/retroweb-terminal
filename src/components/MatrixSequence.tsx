import { useEffect, useState } from "react";
import type { Quote } from "@/lib/quotes";
import { playAutoTypeTick } from "@/lib/crtSounds";

const PHRASE = "Wake up, Neo...";
const CHAR_DELAY = 90;
const QUOTE_CHAR_DELAY = 35;
const CURSOR_PAUSE = 2000;
const POST_TYPE_PAUSE = 1200;

type Phase = "cursor" | "typing" | "pause" | "quote";

type Props = {
  quote: Quote;
  bloomEnabled?: boolean;
  children?: React.ReactNode;
};

export function MatrixSequence({ quote, bloomEnabled = false, children }: Props) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [displayed, setDisplayed] = useState("");
  const [quoteDisplayed, setQuoteDisplayed] = useState("");

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
    const t = window.setTimeout(() => {
      playAutoTypeTick();
      setDisplayed(PHRASE.slice(0, displayed.length + 1));
    }, CHAR_DELAY);
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
    `  -- ${quote.author.toUpperCase()}`,
  ].join("\n");
  const quoteStyle: React.CSSProperties = {
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    lineHeight: "1.7em",
    ...(bloomEnabled ? {} : { textShadow: "none" }),
  };

  // Type the quote after the phrase begins dissolving.
  useEffect(() => {
    if (phase !== "quote") return;
    if (quoteDisplayed.length >= quoteBlock.length) return;
    const t = window.setTimeout(() => {
      playAutoTypeTick();
      setQuoteDisplayed(quoteBlock.slice(0, quoteDisplayed.length + 1));
    }, QUOTE_CHAR_DELAY);
    return () => window.clearTimeout(t);
  }, [phase, quoteBlock, quoteDisplayed]);

  return (
    <div
      className="absolute inset-0 z-[50] overflow-hidden"
      style={{ background: "var(--effective-bg, var(--crt-bg))" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 crt-text text-[var(--phosphor)] text-sm font-mono whitespace-pre">
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
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
            <div className="matrix-phrase-dissolve">{PHRASE}</div>
            <pre className="ascii-pre text-[var(--phosphor)] mt-0 max-w-full" style={quoteStyle}>
              {quoteDisplayed}
              <span className="crt-cursor">&nbsp;</span>
            </pre>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-3 sm:px-6 pb-12">
        {children}
      </div>
    </div>
  );
}
