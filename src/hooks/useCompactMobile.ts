import { useEffect, useState } from "react";

/** Matches Tailwind `sm` portrait phones + landscape phones where the CONFIG bar stays hidden. */
export function matchesCompactMobile(): boolean {
  if (typeof window === "undefined") return false;
  const narrow = window.matchMedia("(max-width: 639px)").matches;
  const landscapePhone = window.matchMedia(
    "(min-width: 640px) and (orientation: landscape) and (max-height: 500px)",
  ).matches;
  return narrow || landscapePhone;
}

export function useCompactMobile(): boolean {
  const [compact, setCompact] = useState(matchesCompactMobile);

  useEffect(() => {
    const qNarrow = window.matchMedia("(max-width: 639px)");
    const qLand = window.matchMedia(
      "(min-width: 640px) and (orientation: landscape) and (max-height: 500px)",
    );
    const sync = () => setCompact(qNarrow.matches || qLand.matches);
    sync();
    qNarrow.addEventListener("change", sync);
    qLand.addEventListener("change", sync);
    return () => {
      qNarrow.removeEventListener("change", sync);
      qLand.removeEventListener("change", sync);
    };
  }, []);

  return compact;
}
