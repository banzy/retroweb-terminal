import type { CSSProperties, ReactNode } from "react";
import { BANNER_WEB1975 } from "@/lib/asciiBanners";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  glassEnabled?: boolean;
  glassIntensity?: number;
  themeLabel?: string;
  scanlineIntensity?: number; // 0..1
  flickerSpeed?: number;      // 0..1 (0 = off, 1 = fastest)
};

export function TerminalShell({
  children,
  style,
  glassEnabled = true,
  glassIntensity = 0.35,
  themeLabel = "P1 GREEN",
  scanlineIntensity = 0.25,
  flickerSpeed = 0.5,
}: Props) {
  // Map flickerSpeed (0..1) to duration + depth.
  // 0 → effectively off (long duration, no depth).
  const flickerDuration = flickerSpeed <= 0 ? "10s" : `${(0.4 - flickerSpeed * 0.35).toFixed(3)}s`;
  const flickerDepth = flickerSpeed <= 0 ? 0 : 0.02 + flickerSpeed * 0.08;

  return (
    <div
      className="crt-screen min-h-screen w-full"
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
        ["--scanline-alpha" as never]: scanlineIntensity,
        ["--flicker-duration" as never]: flickerDuration,
        ["--flicker-depth" as never]: flickerDepth,
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 relative z-10">
        <header className="border border-[var(--phosphor)] p-3 mb-4">
          <pre className="ascii-pre crt-text text-[var(--phosphor-bright)] text-[10px] sm:text-xs leading-tight overflow-x-auto">
{BANNER_WEB1975}
          </pre>
          <div className="crt-text text-[var(--phosphor-bright)] font-bold tracking-wider text-sm sm:text-base mt-2">
            WEB 1975 TERMINAL EMULATOR
          </div>
          <div className="crt-text text-[var(--phosphor-dim)] text-xs mt-1">
            MODE: TEXT ONLY / ASCII / {themeLabel} PHOSPHOR
          </div>
        </header>
        {children}
      </div>
      {glassEnabled && <div className="crt-glass" aria-hidden="true" />}
    </div>
  );
}
