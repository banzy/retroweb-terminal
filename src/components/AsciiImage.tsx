import { useEffect, useState } from "react";
import { convertImageToAscii } from "@/lib/asciiImage";
import { fetchImageAsDataUrl } from "@/lib/fetchWebsite";

type Props = { src: string; width?: number };

export function AsciiImage({ src, width = 80 }: Props) {
  const [ascii, setAscii] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAscii(null);
    setError(null);
    (async () => {
      try {
        const result = await fetchImageAsDataUrl(src);
        if (cancelled) return;
        if (result.error || !result.dataUrl) {
          setError(result.error || "NO DATA");
          return;
        }
        const out = await convertImageToAscii(result.dataUrl, { width });
        if (cancelled) return;
        setAscii(out);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "UNKNOWN ERROR");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, width]);

  if (error) {
    return (
      <pre className="ascii-pre text-[var(--phosphor-dim)] text-xs">
        {`!! IMAGE SIGNAL LOST !!\n!! REASON: ${error} !!\n!! CROSS-ORIGIN OR DECODE FAILURE !!`}
      </pre>
    );
  }
  if (!ascii) {
    return (
      <pre className="ascii-pre text-[var(--phosphor-dim)] text-xs">
        {"DECODING IMAGE SIGNAL..."}
      </pre>
    );
  }
  // Use a ch-based font size so the rendered <pre> always fills ~the same
  // container width regardless of `width`. Higher width = smaller chars =
  // more detail; lower width = chunky pixels. This makes the slider visibly
  // change the look instead of just overflowing horizontally.
  // Char aspect ≈ 0.6 (width per ch). Target ~60ch container.
  const fontPx = Math.max(4, Math.min(20, Math.round(960 / width)));
  return (
    <pre
      className="ascii-pre crt-text text-[var(--phosphor)] leading-[1] overflow-hidden"
      style={{ fontSize: `${fontPx}px`, lineHeight: 1 }}
    >
      {ascii}
    </pre>
  );
}
