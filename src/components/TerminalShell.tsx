import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  glassEnabled?: boolean;
  glassIntensity?: number;
  themeLabel?: string;
  scanlineIntensity?: number; // 0..1
  flickerSpeed?: number;      // 0..1 (0 = off, 1 = fastest)
  scanBeamSpeed?: number;     // 0..1 (0 = off, 1 = fastest sweep)
};

export function TerminalShell({
  children,
  style,
  glassEnabled = true,
  glassIntensity = 0.35,
  themeLabel = "P1 GREEN",
  scanlineIntensity = 0.25,
  flickerSpeed = 0.5,
  scanBeamSpeed = 0.4,
}: Props) {
  // Map flickerSpeed (0..1) to duration + depth.
  // 0 → effectively off (long duration, no depth).
  const flickerDuration = flickerSpeed <= 0 ? "10s" : `${(0.4 - flickerSpeed * 0.35).toFixed(3)}s`;
  const flickerDepth = flickerSpeed <= 0 ? 0 : 0.02 + flickerSpeed * 0.08;
  // Map scanBeamSpeed: 0 → off, otherwise 12s (slow) → 1.5s (fast)
  const beamEnabled = scanBeamSpeed > 0;
  const beamDuration = beamEnabled ? `${(12 - scanBeamSpeed * 10.5).toFixed(2)}s` : "0s";

  return (
    <div
      className="crt-screen min-h-screen w-full"
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
        ["--scanline-alpha" as never]: scanlineIntensity,
        ["--flicker-duration" as never]: flickerDuration,
        ["--flicker-depth" as never]: flickerDepth,
        ["--scan-beam-duration" as never]: beamDuration,
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 relative z-10">
        <header className="border border-[var(--phosphor)] p-3 mb-4">
          <div className="crt-text text-[var(--phosphor-bright)] font-bold tracking-wider text-sm sm:text-base">
            WEB 1975 TERMINAL EMULATOR
          </div>
          <div className="crt-text text-[var(--phosphor-dim)] text-xs mt-1">
            MODE: TEXT ONLY / ASCII / {themeLabel} PHOSPHOR
          </div>
        </header>
        {children}
      </div>
      {glassEnabled && <div className="crt-glass" aria-hidden="true" />}
      {beamEnabled && <div className="crt-scan-beam" aria-hidden="true" />}
    </div>
  );
}
