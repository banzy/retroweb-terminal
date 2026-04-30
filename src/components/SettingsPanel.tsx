import { useState } from "react";
import { PRESET_THEMES, type CrtTheme } from "@/lib/crtThemes";

type Props = {
  asciiWidth: number;
  setAsciiWidth: (n: number) => void;
  theme: CrtTheme;
  setTheme: (t: CrtTheme) => void;
  glassEnabled: boolean;
  setGlassEnabled: (b: boolean) => void;
  glassIntensity: number;
  setGlassIntensity: (n: number) => void;
  scanlineIntensity: number;
  setScanlineIntensity: (n: number) => void;
  flickerSpeed: number;
  setFlickerSpeed: (n: number) => void;
  scanBeamSpeed: number;
  setScanBeamSpeed: (n: number) => void;
  bgTint: number;
  setBgTint: (n: number) => void;
  bgRadial: boolean;
  setBgRadial: (b: boolean) => void;
};

export function SettingsPanel({
  asciiWidth,
  setAsciiWidth,
  theme,
  setTheme,
  glassEnabled,
  setGlassEnabled,
  glassIntensity,
  setGlassIntensity,
  scanlineIntensity,
  setScanlineIntensity,
  flickerSpeed,
  setFlickerSpeed,
  scanBeamSpeed,
  setScanBeamSpeed,
  bgTint,
  setBgTint,
  bgRadial,
  setBgRadial,
}: Props) {
  const [open, setOpen] = useState(false);
  const isCustom = theme.id === "custom";

  function updateCustom(field: "bg" | "phosphor" | "bright" | "dim", value: string) {
    setTheme({
      ...theme,
      id: "custom",
      label: "CUSTOM",
      [field]: value,
    } as CrtTheme);
  }

  function selectPreset(id: string) {
    const p = PRESET_THEMES.find((x) => x.id === id);
    if (p) setTheme(p);
  }

  return (
    <div className="border border-[var(--phosphor-dim)] mt-3 text-xs crt-text text-[var(--phosphor-dim)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:text-[var(--phosphor)] font-mono"
      >
        <span>[{open ? "-" : "+"}] CONFIG :: TERMINAL SETTINGS</span>
        <span className="text-[var(--phosphor-dim)] hidden sm:inline">
          THEME={theme.label} | GLASS={glassEnabled ? "ON" : "OFF"} |
          SCAN={Math.round(scanlineIntensity * 100)}% |
          FLK={Math.round(flickerSpeed * 100)}%
        </span>
      </button>

      {open && (
        <div className="border-t border-[var(--phosphor-dim)] p-3 space-y-4">
          {/* Presets */}
          <div>
            <div className="mb-2 text-[var(--phosphor)]">&gt; COLOR PRESETS:</div>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((p) => {
                const active = theme.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPreset(p.id)}
                    className="border px-2 py-1 font-mono text-xs"
                    style={{
                      background: p.bg,
                      color: p.phosphor,
                      borderColor: active ? p.bright : p.dim,
                      textShadow: `0 0 4px ${p.phosphor}`,
                    }}
                  >
                    {active ? "[*]" : "[ ]"} {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setTheme({
                    id: "custom",
                    label: "CUSTOM",
                    bg: theme.bg,
                    phosphor: theme.phosphor,
                    bright: theme.bright,
                    dim: theme.dim,
                  })
                }
                className="border border-[var(--phosphor-dim)] px-2 py-1 font-mono text-xs text-[var(--phosphor)]"
              >
                {isCustom ? "[*]" : "[ ]"} CUSTOM
              </button>
            </div>
          </div>

          {/* Custom colors */}
          {isCustom && (
            <div>
              <div className="mb-2 text-[var(--phosphor)]">&gt; CUSTOM COLORS:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ColorField label="BG" value={theme.bg} onChange={(v) => updateCustom("bg", v)} />
                <ColorField label="TEXT" value={theme.phosphor} onChange={(v) => updateCustom("phosphor", v)} />
                <ColorField label="BRIGHT" value={theme.bright} onChange={(v) => updateCustom("bright", v)} />
                <ColorField label="DIM" value={theme.dim} onChange={(v) => updateCustom("dim", v)} />
              </div>
            </div>
          )}

          {/* Glass */}
          <div>
            <div className="mb-2 text-[var(--phosphor)]">&gt; CRT GLASS REFLECTION:</div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={glassEnabled}
                  onChange={(e) => setGlassEnabled(e.target.checked)}
                  className="accent-[var(--phosphor)]"
                />
                ENABLE GLASS
              </label>
              <label className="flex items-center gap-2 flex-1 min-w-[200px]">
                INTENSITY=
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(glassIntensity * 100)}
                  onChange={(e) => setGlassIntensity(parseInt(e.target.value, 10) / 100)}
                  disabled={!glassEnabled}
                  className="flex-1 accent-[var(--phosphor)]"
                />
                <span className="w-10 text-right text-[var(--phosphor)]">
                  {Math.round(glassIntensity * 100)}%
                </span>
              </label>
            </div>
          </div>

          {/* CRT effect tuning */}
          <div>
            <div className="mb-2 text-[var(--phosphor)]">&gt; CRT EFFECTS:</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <span className="w-24">FLICKER=</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(flickerSpeed * 100)}
                  onChange={(e) => setFlickerSpeed(parseInt(e.target.value, 10) / 100)}
                  className="flex-1 accent-[var(--phosphor)]"
                />
                <span className="w-10 text-right text-[var(--phosphor)]">
                  {flickerSpeed <= 0 ? "OFF" : `${Math.round(flickerSpeed * 100)}%`}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <span className="w-24">SCAN_BEAM=</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(scanBeamSpeed * 100)}
                  onChange={(e) => setScanBeamSpeed(parseInt(e.target.value, 10) / 100)}
                  className="flex-1 accent-[var(--phosphor)]"
                />
                <span className="w-10 text-right text-[var(--phosphor)]">
                  {scanBeamSpeed <= 0 ? "OFF" : `${Math.round(scanBeamSpeed * 100)}%`}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <span className="w-24">BG_TINT=</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(bgTint * 100)}
                  onChange={(e) => setBgTint(parseInt(e.target.value, 10) / 100)}
                  className="flex-1 accent-[var(--phosphor)]"
                />
                <span className="w-10 text-right text-[var(--phosphor)]">
                  {Math.round(bgTint * 100)}%
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bgRadial}
                  onChange={(e) => setBgRadial(e.target.checked)}
                  className="accent-[var(--phosphor)]"
                />
                BG_RADIAL VIGNETTE
              </label>
            </div>
          </div>

          {/* Ascii width */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--phosphor)]">&gt; ASCII_WIDTH=</span>
            <select
              value={asciiWidth}
              onChange={(e) => setAsciiWidth(parseInt(e.target.value, 10))}
              className="bg-[var(--crt-bg)] border border-[var(--phosphor-dim)] text-[var(--phosphor)] px-2 py-1 font-mono"
            >
              <option value={60}>60</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
              <option value={120}>120</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 border border-[var(--phosphor-dim)] px-2 py-1">
      <span className="text-[var(--phosphor)] w-12">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 bg-transparent border-0 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-[var(--phosphor)] outline-none font-mono text-xs"
      />
    </label>
  );
}
