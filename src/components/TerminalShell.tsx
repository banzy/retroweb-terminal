import { useState, type CSSProperties, type ReactNode } from "react";
import type { CabinetId } from "@/lib/crtThemes";

type Props = {
  children: ReactNode;
  overlay?: ReactNode;
  style?: CSSProperties;
  glassEnabled?: boolean;
  glassIntensity?: number;
  themeLabel?: string;
  scanlineIntensity?: number;
  bgTint?: number;
  bgRadial?: boolean;
  curvature?: boolean;
  rgbSplit?: number;
  bloom?: boolean;
  trackingGlitch?: boolean;
  powerAnim?: boolean;
  burnIn?: boolean;
  cabinet?: CabinetId;
  collapsing?: boolean;
};

export function TerminalShell({
  children,
  overlay,
  style,
  glassEnabled = true,
  glassIntensity = 0.35,
  themeLabel = "P1 GREEN",
  scanlineIntensity = 0.25,
  bgTint = 0,
  bgRadial = true,
  curvature = false,
  rgbSplit = 0,
  bloom = false,
  trackingGlitch = false,
  powerAnim = false,
  burnIn = false,
  cabinet = "none",
  collapsing = false,
}: Props) {
  const effectiveBg = `color-mix(in oklab, var(--phosphor-dim) ${Math.round(
    bgTint * 100,
  )}%, #000000)`;

  // Power-on plays only once on initial page load when enabled.
  // Capture the toggle value at mount; later toggles won't replay it.
  const [powerOnAtMount] = useState(powerAnim);

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

  const screen = (
    <div
      className={classes}
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
        ["--scanline-alpha" as never]: scanlineIntensity,
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
        className={`crt-curve-inner max-w-5xl mx-auto px-3 sm:px-6 py-6 relative z-10 ${collapsing ? "crt-power-off" : powerOnAtMount ? "crt-power-on" : ""}`}
      >
        <header className="border border-[var(--phosphor)] p-3 mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="crt-text text-[var(--phosphor-bright)] font-bold tracking-wider text-sm sm:text-base">
              WEB 1975 TERMINAL EMULATOR
            </div>
            <div className="crt-text text-[var(--phosphor-dim)] text-xs mt-1">
              MODE: TEXT ONLY / ASCII / {themeLabel} PHOSPHOR
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("w1975:reboot"))}
            className="crt-text text-[var(--phosphor)] hover:text-[var(--phosphor-bright)] font-mono text-xs underline underline-offset-2 shrink-0 mt-0.5"
            aria-label="Reboot machine"
          >
            [ REBOOT ]
          </button>
        </header>
        {children}
      </div>
      {overlay}
      {glassEnabled && <div className="crt-glass" aria-hidden="true" />}
    </div>
  );

  if (cabinet && cabinet !== "none") {
    return (
      <div className={`crt-cabinet crt-cab-${cabinet}`} style={style}>
        <div className="crt-cabinet-screen">{screen}</div>
      </div>
    );
  }
  return screen;
}
