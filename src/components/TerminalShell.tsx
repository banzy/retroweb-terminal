import type { CSSProperties, ReactNode } from "react";
import { BANNER_WEB1975 } from "@/lib/asciiBanners";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  glassEnabled?: boolean;
  glassIntensity?: number;
  themeLabel?: string;
};

export function TerminalShell({
  children,
  style,
  glassEnabled = true,
  glassIntensity = 0.35,
  themeLabel = "P1 GREEN",
}: Props) {
  return (
    <div
      className="crt-screen min-h-screen w-full"
      style={{
        ...style,
        ["--glass-intensity" as never]: glassIntensity,
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
