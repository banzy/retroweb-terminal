import { useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  glassEnabled?: boolean;
  glassIntensity?: number;
  themeLabel?: string;
  scanlineIntensity?: number;
  flickerSpeed?: number;
  scanBeamSpeed?: number;
  bgTint?: number;
  bgRadial?: boolean;
  curvature?: boolean;
  rgbSplit?: number;
  bloom?: boolean;
  trackingGlitch?: boolean;
  powerAnim?: boolean;
  burnIn?: boolean;
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
  curvature = false,
  rgbSplit = 0,
  bloom = false,
  trackingGlitch = false,
  powerAnim = false,
  burnIn = false,
}: Props) {
  const flickerDuration = flickerSpeed <= 0 ? "10s" : `${(0.4 - flickerSpeed * 0.35).toFixed(3)}s`;
  const flickerDepth = flickerSpeed <= 0 ? 0 : 0.02 + flickerSpeed * 0.08;
  const beamEnabled = scanBeamSpeed > 0;
  const beamDuration = beamEnabled ? `${(30 - scanBeamSpeed * 24).toFixed(2)}s` : "0s";
  const effectiveBg = `color-mix(in oklab, var(--phosphor-dim) ${Math.round(
    bgTint * 100,
  )}%, #000000)`;

  // Power-on plays only on first mount when enabled.
  const [powerKey] = useState(() => Date.now());

  const classes = [
    "crt-screen min-h-screen w-full",
    bgRadial ? "" : "crt-flat",
    curvature ? "crt-curve" : "",
    rgbSplit > 0 ? "crt-rgb-split" : "",
    bloom ? "crt-bloom" : "",
    trackingGlitch ? "crt-tracking-glitch" : "",
    burnIn ? "crt-burnin" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
        ["--scanline-alpha" as never]: scanlineIntensity,
        ["--flicker-duration" as never]: flickerDuration,
        ["--flicker-depth" as never]: flickerDepth,
        ["--scan-beam-duration" as never]: beamDuration,
        ["--effective-bg" as never]: effectiveBg,
        ["--rgb-split" as never]: `${(rgbSplit * 3).toFixed(2)}px`,
        backgroundColor: effectiveBg,
      }}
    >
      {curvature && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id="crt-barrel">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
            </filter>
          </defs>
        </svg>
      )}
      <div
        key={powerAnim ? `pwr-${powerKey}` : "static"}
        className={`crt-curve-inner max-w-5xl mx-auto px-3 sm:px-6 py-6 relative z-10 ${powerAnim ? "crt-power-on" : ""}`}
      >
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