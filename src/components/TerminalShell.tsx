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
  bgTint?: number;            // 0..1 (0 = pure black, 1 = theme dim color)
  bgRadial?: boolean;         // toggle radial vignette background
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
  bgTint = 0,
  bgRadial = true,
}: Props) {
  // Map flickerSpeed (0..1) to duration + depth.
  // 0 → effectively off (long duration, no depth).
  const flickerDuration = flickerSpeed <= 0 ? "10s" : `${(0.4 - flickerSpeed * 0.35).toFixed(3)}s`;
  const flickerDepth = flickerSpeed <= 0 ? 0 : 0.02 + flickerSpeed * 0.08;
  // Map scanBeamSpeed: 0 → off, otherwise 30s (very slow) → 6s (fast)
  const beamEnabled = scanBeamSpeed > 0;
  const beamDuration = beamEnabled ? `${(30 - scanBeamSpeed * 24).toFixed(2)}s` : "0s";
  // Mix pure black with theme's --phosphor-dim by bgTint%.
  const effectiveBg = `color-mix(in oklab, var(--phosphor-dim) ${Math.round(
    bgTint * 100,
  )}%, #000000)`;

  return (
    <div
      className={`crt-screen min-h-screen w-full${bgRadial ? "" : " crt-flat"}`}
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
        ["--scanline-alpha" as never]: scanlineIntensity,
        ["--flicker-duration" as never]: flickerDuration,
        ["--flicker-depth" as never]: flickerDepth,
        ["--scan-beam-duration" as never]: beamDuration,
        ["--effective-bg" as never]: effectiveBg,
        backgroundColor: effectiveBg,
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
