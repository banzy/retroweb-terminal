import { useEffect, useState } from "react";

type Props = {
  onDone: () => void;
  delayMs?: number;
};

const LINES: Array<{ text: string; pause: number }> = [
  { text: "BIOS v0.1.7  (C) 2026 RETROWEB SYSTEMS", pause: 180 },
  { text: "CPU: PDP-11/45 @ 1.25 MHz   FPU: NONE", pause: 120 },
  { text: "ROM CHECKSUM: 7F3A...........[ OK ]", pause: 120 },
  { text: "CLOCK: 60HZ SYNC.............[ OK ]", pause: 120 },
  { text: "", pause: 80 },
  { text: "POST: KEYBOARD................[ OK ]", pause: 140 },
  { text: "POST: SERIAL UART.............[ OK ]", pause: 140 },
  { text: "POST: VIDEO CONTROLLER........[ OK ]", pause: 140 },
  { text: "POST: DREAM BUFFER............[ OK ]", pause: 140 },
  { text: "POST: WHITE RABBIT VECTOR.....[ OK ]", pause: 140 },
  { text: "", pause: 60 },
  { text: "LOADING KERNEL IMAGE..........[ OK ]", pause: 120 },
  { text: "LOADING KERNEL IMAGE..........[ OK ]", pause: 160 },
  { text: "MOUNTING /DEV/TAPE0...........[ OK ]", pause: 140 },
  { text: "INITIALIZING TERMINAL MATRIX..[ OK ]", pause: 180 },
  { text: "", pause: 60 },
  { text: "MEMORY TEST:", pause: 100 },
];

const RAM_TARGET = 64; // KiB

export function BootSequence({ onDone, delayMs = 0 }: Props) {
  const [idx, setIdx] = useState(0);
  const [ram, setRam] = useState(0);
  const [phase, setPhase] = useState<"wait" | "lines" | "ram" | "tail" | "hold" | "done">(
    delayMs > 0 ? "wait" : "lines",
  );
  const [tailIdx, setTailIdx] = useState(0);

  // Optional delay (used to play AFTER power-on animation)
  useEffect(() => {
    if (phase !== "wait") return;
    const t = window.setTimeout(() => setPhase("lines"), delayMs);
    return () => window.clearTimeout(t);
  }, [phase, delayMs]);

  // Print POST lines
  useEffect(() => {
    if (phase !== "lines") return;
    if (idx >= LINES.length) {
      setPhase("ram");
      return;
    }
    const t = window.setTimeout(() => setIdx((i) => i + 1), LINES[idx].pause);
    return () => window.clearTimeout(t);
  }, [phase, idx]);

  // RAM count up
  useEffect(() => {
    if (phase !== "ram") return;
    if (ram >= RAM_TARGET) {
      const t = window.setTimeout(() => setPhase("tail"), 250);
      return () => window.clearTimeout(t);
    }
    const step = Math.max(1, Math.floor(RAM_TARGET / 24));
    const t = window.setTimeout(() => setRam((r) => Math.min(RAM_TARGET, r + step)), 35);
    return () => window.clearTimeout(t);
  }, [phase, ram]);

  // Tail lines + finish
  const TAIL = [
    `MEMORY OK: ${RAM_TARGET}K`,
    "",
    "SEEKING BOOT SECTOR..........[ OK ]",
    "LOADING DREAM STATE..........[ OK ]",
    "BOOTING FROM TAPE 0...",
    "READY.",
  ];
  useEffect(() => {
    if (phase !== "tail") return;
    if (tailIdx >= TAIL.length) {
      const t = window.setTimeout(() => setPhase("hold"), 200);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setTailIdx((i) => i + 1), 220);
    return () => window.clearTimeout(t);
  }, [phase, tailIdx]);

  // Hold the finished boot text on screen, then dissolve away
  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => {
      setPhase("done");
      onDone();
    }, 1600);
    return () => window.clearTimeout(t);
  }, [phase, onDone]);

  if (phase === "done") return null;

  return (
    <div
      className="absolute inset-0 z-[50] overflow-hidden"
      style={{ background: "var(--effective-bg, var(--crt-bg))" }}
    >
      <div
        className={`max-w-5xl mx-auto px-4 py-6 crt-text text-[var(--phosphor)] text-sm font-mono whitespace-pre ${phase === "hold" ? "boot-dissolve" : ""}`}
      >
        <div>{"\u00a0"}</div>
        <div>{"\u00a0"}</div>
        {LINES.slice(0, idx).map((l, i) => (
          <div key={`l-${i}`}>{l.text || "\u00a0"}</div>
        ))}
        {(phase === "ram" || phase === "tail" || phase === "hold") && (
          <div>{`  ${Math.round((ram / RAM_TARGET) * 100).toString().padStart(3, " ")}%  ${ram.toString().padStart(3, " ")}K / ${RAM_TARGET}K  ${phase === "ram" ? "..." : "[ OK ]"}`}</div>
        )}
        {(phase === "tail" || phase === "hold") &&
          TAIL.slice(0, tailIdx).map((l, i) => <div key={`t-${i}`}>{l || "\u00a0"}</div>)}
        <div className="crt-cursor crt-text text-[var(--phosphor)]">&nbsp;</div>
      </div>
    </div>
  );
}
