import { useEffect, useState } from "react";
import { convertImageToAscii } from "@/lib/asciiImage";
import { fetchImageAsDataUrl } from "@/server/fetchWebsite.functions";

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
        const result = await fetchImageAsDataUrl({ data: { url: src } });
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
  // Font size scales inversely with chosen width so 60 looks chunky and
  // 120 looks fine — otherwise wider output just overflows horizontally.
  const fontPx = Math.max(5, Math.min(12, Math.round(720 / width)));
  return (
    <pre
      className="ascii-pre crt-text text-[var(--phosphor)] leading-[1] overflow-x-auto"
      style={{ fontSize: `${fontPx}px` }}
    >
      {ascii}
    </pre>
  );
}