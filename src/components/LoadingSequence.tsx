import { useEffect, useState } from "react";

const STEPS = [
  "CONNECTING TO REMOTE HOST...",
  "RECEIVING HTML SIGNAL...",
  "STRIPPING MODERN STYLING...",
  "CONVERTING IMAGE TO ASCII...",
  "RENDERING 1975 TERMINAL VIEW...",
];

export function LoadingSequence() {
  const [shown, setShown] = useState<string[]>([]);

  useEffect(() => {
    setShown([]);
    let i = 0;
    const id = setInterval(() => {
      setShown((s) => [...s, STEPS[i]]);
      i++;
      if (i >= STEPS.length) clearInterval(id);
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border border-[var(--phosphor-dim)] p-4 my-4">
      {shown.map((s, i) => (
        <div key={i} className="crt-text text-[var(--phosphor)] text-sm">
          {">> "}{s}
        </div>
      ))}
      <div className="crt-text text-[var(--phosphor)] text-sm crt-cursor">{">> "}</div>
    </div>
  );
}
