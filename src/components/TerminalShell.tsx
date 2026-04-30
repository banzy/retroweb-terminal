import type { ReactNode } from "react";

export function TerminalShell({ children }: { children: ReactNode }) {
  return (
    <div className="crt-screen min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        <header className="border border-[var(--phosphor)] p-3 mb-4">
          <div className="crt-text text-[var(--phosphor-bright)] font-bold tracking-wider text-sm sm:text-base">
            WEB 1975 TERMINAL EMULATOR
          </div>
          <div className="crt-text text-[var(--phosphor-dim)] text-xs mt-1">
            MODE: TEXT ONLY / ASCII / GREEN PHOSPHOR
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
