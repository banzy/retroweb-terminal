import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Quote } from "@/lib/quotes";
import { isAudioReady, playAutoTypeTick, subscribeAudioReady } from "@/lib/crtSounds";

const PHRASE = "Wake up, Neo...";
const CHAR_DELAY = 36;
const QUOTE_CHAR_DELAY = 36;
const CURSOR_PAUSE = 2400;
/** Wait (cap) for AudioContext to run so ticks use a moving clock; avoids silent/broken scheduling while suspended. */
const AUDIO_GATE_MAX_MS = 400;
/** Pause after the phrase finishes, before the quote appears (ms). */
const POST_TYPE_PAUSE = 3200;
/** Delay between dismissing the current quote and showing the next one (ms). */
export const NEXT_QUOTE_DELAY = 2000;

type Phase = "cursor" | "typing" | "pause" | "quote";

type Props = {
  quote: Quote;
  bloomEnabled?: boolean;
  skipping?: boolean;
  /** Tap / click the finished quote to advance (e.g. mobile when CONFIG bar is hidden). */
  onNextQuote?: () => void;
  nextQuoteDisabled?: boolean;
  children?: React.ReactNode;
};

export function MatrixSequence({
  quote,
  bloomEnabled = false,
  skipping = false,
  onNextQuote,
  nextQuoteDisabled = false,
  children,
}: Props) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [displayed, setDisplayed] = useState("");
  const [quoteDisplayed, setQuoteDisplayed] = useState("");
  const [typingAllowed, setTypingAllowed] = useState(() => isAudioReady());
  const prevQuoteId = useRef(quote.id);

  useEffect(() => {
    if (typingAllowed) return;
    const unsub = subscribeAudioReady(() => setTypingAllowed(true));
    const t = window.setTimeout(() => setTypingAllowed(true), AUDIO_GATE_MAX_MS);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, [typingAllowed]);

  useEffect(() => {
    if (phase !== "cursor") return;
    if (!typingAllowed) return;
    const t = window.setTimeout(() => setPhase("typing"), CURSOR_PAUSE);
    return () => window.clearTimeout(t);
  }, [phase, typingAllowed]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== "typing") return;
    if (displayed.length >= PHRASE.length) {
      setPhase("pause");
      return;
    }
    const t = window.setTimeout(() => {
      setDisplayed(PHRASE.slice(0, displayed.length + 1));
    }, CHAR_DELAY);
    return () => window.clearTimeout(t);
  }, [phase, displayed]);

  // Play the tick after the character is committed to the DOM, so audio
  // and the visible glyph land in the same paint frame.
  useLayoutEffect(() => {
    if (phase !== "typing" || displayed.length === 0) return;
    playAutoTypeTick();
  }, [displayed, phase]);

  // Brief pause after typing → show quote
  useEffect(() => {
    if (phase !== "pause") return;
    const t = window.setTimeout(() => setPhase("quote"), POST_TYPE_PAUSE);
    return () => window.clearTimeout(t);
  }, [phase]);

  const quoteBlock = ["", `"${quote.quote}"`, "", `  -- ${quote.author.toUpperCase()}`].join("\n");
  const quoteStyle: React.CSSProperties = {
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    lineHeight: "1.7em",
    ...(bloomEnabled ? {} : { textShadow: "none" }),
  };

  // When the parent provides a new quote, reset typing state.
  useEffect(() => {
    if (quote.id === prevQuoteId.current) return;
    prevQuoteId.current = quote.id;
    setQuoteDisplayed("");
  }, [quote]);

  // Type the quote after the phrase begins dissolving.
  useEffect(() => {
    if (phase !== "quote") return;
    if (quoteDisplayed.length >= quoteBlock.length) return;
    const t = window.setTimeout(() => {
      setQuoteDisplayed(quoteBlock.slice(0, quoteDisplayed.length + 1));
    }, QUOTE_CHAR_DELAY);
    return () => window.clearTimeout(t);
  }, [phase, quoteBlock, quoteDisplayed]);

  // Play the tick aligned with the just-committed quote character. Skip
  // whitespace so the rhythm tracks the visible glyphs only.
  useLayoutEffect(() => {
    if (phase !== "quote" || quoteDisplayed.length === 0) return;
    const last = quoteDisplayed[quoteDisplayed.length - 1];
    if (last === " " || last === "\n") return;
    playAutoTypeTick();
  }, [quoteDisplayed, phase]);

  const quoteComplete = phase === "quote" && quoteDisplayed.length >= quoteBlock.length;
  const quoteInteractive = Boolean(onNextQuote && quoteComplete && !skipping && !nextQuoteDisabled);

  return (
    <div
      className="absolute inset-0 z-[50] overflow-hidden"
      style={{ background: "var(--effective-bg, var(--crt-bg))" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 crt-text text-[var(--phosphor)] text-sm font-mono whitespace-pre">
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
            <pre
              className={`ascii-pre text-[var(--phosphor)] mt-0 max-w-full ${
                quoteInteractive
                  ? "cursor-pointer hover:text-[var(--phosphor-bright)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--phosphor)] focus-visible:ring-inset"
                  : ""
              }`}
              style={{
                ...quoteStyle,
                transition: skipping ? `opacity ${NEXT_QUOTE_DELAY}ms linear` : "none",
                opacity: skipping ? 0 : 1,
              }}
              role={quoteInteractive ? "button" : undefined}
              tabIndex={quoteInteractive ? 0 : undefined}
              aria-label={quoteInteractive ? "Show another quote" : undefined}
              onClick={() => {
                if (!quoteInteractive || !onNextQuote) return;
                onNextQuote();
              }}
              onKeyDown={(e) => {
                if (!quoteInteractive || !onNextQuote) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNextQuote();
                }
              }}
            >
              {quoteDisplayed}
              {!skipping && <span className="crt-cursor">&nbsp;</span>}
            </pre>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-3 sm:px-6 pb-12 hidden sm:block [@media(min-width:640px)_and_(orientation:landscape)_and_(max-height:500px)]:!hidden">
        {children}
      </div>
    </div>
  );
}
