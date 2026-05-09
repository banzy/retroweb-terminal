import { useState } from "react";
import { PRESET_THEMES, CABINETS, type CrtTheme, type CabinetId } from "@/lib/crtThemes";
import type { CrtFont, FontId } from "@/lib/crtFonts";
import { playToggleClick, type SoundLoudness } from "@/lib/crtSounds";

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
  bgTint: number;
  setBgTint: (n: number) => void;
  bgRadial: boolean;
  setBgRadial: (b: boolean) => void;
  curvature: boolean;
  setCurvature: (b: boolean) => void;
  rgbSplit: number;
  setRgbSplit: (n: number) => void;
  bloom: boolean;
  setBloom: (b: boolean) => void;
  trackingGlitch: boolean;
  setTrackingGlitch: (b: boolean) => void;
  powerAnim: boolean;
  setPowerAnim: (b: boolean) => void;
  burnIn: boolean;
  setBurnIn: (b: boolean) => void;
  sndToggle: boolean;
  setSndToggle: (b: boolean) => void;
  sndAutoType: boolean;
  setSndAutoType: (b: boolean) => void;
  soundLoudness: SoundLoudness;
  setSoundLoudness: (v: SoundLoudness) => void;
  cabinet: CabinetId;
  setCabinet: (c: CabinetId) => void;
  savedThemes: CrtTheme[];
  setSavedThemes: (t: CrtTheme[]) => void;
  bootSeq: boolean;
  setBootSeq: (b: boolean) => void;
  fontId: FontId;
  setFontId: (id: FontId) => void;
  fonts: CrtFont[];
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
  bgTint,
  setBgTint,
  bgRadial,
  setBgRadial,
  curvature,
  setCurvature,
  rgbSplit,
  setRgbSplit,
  bloom,
  setBloom,
  trackingGlitch,
  setTrackingGlitch,
  powerAnim,
  setPowerAnim,
  burnIn,
  setBurnIn,
  sndToggle,
  setSndToggle,
  sndAutoType,
  setSndAutoType,
  soundLoudness,
  setSoundLoudness,
  cabinet,
  setCabinet,
  savedThemes,
  setSavedThemes,
  bootSeq,
  setBootSeq,
  fontId,
  setFontId,
  fonts,
}: Props) {
  const [open, setOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
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

  function saveCurrentTheme() {
    const name = saveName.trim() || `CUSTOM ${savedThemes.length + 1}`;
    const id = `saved-${Date.now()}`;
    setSavedThemes([
      ...savedThemes,
      {
        id,
        label: name.toUpperCase(),
        bg: theme.bg,
        phosphor: theme.phosphor,
        bright: theme.bright,
        dim: theme.dim,
      },
    ]);
    setSaveName("");
  }

  function deleteSaved(id: string) {
    setSavedThemes(savedThemes.filter((t) => t.id !== id));
  }

  return (
    <div className="border border-[var(--phosphor-dim)] mt-3 text-xs crt-text text-[var(--phosphor-dim)]">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center justify-between px-3 py-2 hover:text-[var(--phosphor)] font-mono"
        >
          <span>[{open ? "-" : "+"}] CONFIG :: TERMINAL SETTINGS</span>
          <span className="text-[var(--phosphor-dim)] hidden sm:inline">
            THEME={theme.label} | GLASS={glassEnabled ? "ON" : "OFF"} | SCAN=
            {Math.round(scanlineIntensity * 100)}%
          </span>
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("w1975:reboot"))}
          className="px-3 py-2 crt-text text-[var(--phosphor-dim)] hover:text-[var(--phosphor)] font-mono text-xs underline underline-offset-2"
        >
          [ REBOOT ]
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--phosphor-dim)] p-3 space-y-4">
          {/* Themes & presets */}
          <div>
            <button
              type="button"
              onClick={() => setThemesOpen((v) => !v)}
              className="text-[var(--phosphor)] hover:text-[var(--phosphor-bright)] font-mono mb-2"
            >
              [{themesOpen ? "-" : "+"}] THEMES &amp; PRESETS
            </button>
            {themesOpen && (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-[var(--phosphor)]">&gt; PHOSPHOR PRESETS:</div>
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

                {isCustom && (
                  <div>
                    <div className="mb-1 text-[var(--phosphor)]">&gt; CUSTOM COLORS:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <ColorField
                        label="BG"
                        value={theme.bg}
                        onChange={(v) => updateCustom("bg", v)}
                      />
                      <ColorField
                        label="TEXT"
                        value={theme.phosphor}
                        onChange={(v) => updateCustom("phosphor", v)}
                      />
                      <ColorField
                        label="BRIGHT"
                        value={theme.bright}
                        onChange={(v) => updateCustom("bright", v)}
                      />
                      <ColorField
                        label="DIM"
                        value={theme.dim}
                        onChange={(v) => updateCustom("dim", v)}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="THEME NAME"
                        className="flex-1 bg-transparent border border-[var(--phosphor-dim)] text-[var(--phosphor)] px-2 py-1 font-mono text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={saveCurrentTheme}
                        className="border border-[var(--phosphor)] text-[var(--phosphor)] px-2 py-1 font-mono text-xs hover:bg-[var(--phosphor)] hover:text-[var(--primary-foreground)]"
                      >
                        [ SAVE ]
                      </button>
                    </div>
                  </div>
                )}

                {savedThemes.length > 0 && (
                  <div>
                    <div className="mb-1 text-[var(--phosphor)]">&gt; SAVED THEMES:</div>
                    <div className="flex flex-wrap gap-2">
                      {savedThemes.map((p) => {
                        const active = theme.id === p.id;
                        return (
                          <span
                            key={p.id}
                            className="inline-flex items-center border font-mono text-xs"
                            style={{
                              background: p.bg,
                              color: p.phosphor,
                              borderColor: active ? p.bright : p.dim,
                              textShadow: `0 0 4px ${p.phosphor}`,
                            }}
                          >
                            <button type="button" onClick={() => setTheme(p)} className="px-2 py-1">
                              {active ? "[*]" : "[ ]"} {p.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSaved(p.id)}
                              className="px-1 py-1 border-l opacity-70 hover:opacity-100"
                              style={{ borderColor: p.dim }}
                              aria-label={`Delete ${p.label}`}
                            >
                              [x]
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-1 text-[var(--phosphor)]">&gt; CABINET FRAME:</div>
                  <div className="flex flex-wrap gap-2">
                    {CABINETS.map((c) => {
                      const active = cabinet === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            playToggleClick();
                            setCabinet(c.id);
                          }}
                          className="border border-[var(--phosphor-dim)] text-[var(--phosphor)] px-2 py-1 font-mono text-xs hover:border-[var(--phosphor)]"
                        >
                          {active ? "[*]" : "[ ]"} {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fonts */}
          <div>
            <div className="mb-2 text-[var(--phosphor)]">&gt; TERMINAL FONT:</div>
            <div className="flex flex-wrap gap-2">
              {fonts.map((f) => {
                const active = fontId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      playToggleClick();
                      setFontId(f.id);
                    }}
                    className="border px-2 py-1 text-xs"
                    style={{
                      fontFamily: f.stack,
                      borderColor: active ? "var(--phosphor)" : "var(--phosphor-dim)",
                      color: "var(--phosphor)",
                    }}
                  >
                    {active ? "[*]" : "[ ]"} {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glass */}
          <div>
            <div className="mb-2 text-[var(--phosphor)]">&gt; CRT GLASS REFLECTION:</div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={glassEnabled}
                  onChange={(e) => setGlassEnabled(e.target.checked)}
                  className="crt-checkbox"
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
                  className="crt-range flex-1"
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
                <span className="w-24">BG_TINT=</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(bgTint * 100)}
                  onChange={(e) => setBgTint(parseInt(e.target.value, 10) / 100)}
                  className="crt-range flex-1"
                />
                <span className="w-10 text-right text-[var(--phosphor)]">
                  {Math.round(bgTint * 100)}%
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bootSeq}
                  onChange={(e) => {
                    playToggleClick();
                    setBootSeq(e.target.checked);
                  }}
                  className="crt-checkbox"
                />
                BOOT_SEQUENCE
              </label>
            </div>
          </div>

          {/* Ascii width */}
          <div className="hidden">
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

          {/* Advanced */}
          <div className="border-t border-[var(--phosphor-dim)] pt-3">
            <button
              type="button"
              onClick={() => setAdvOpen((v) => !v)}
              className="text-[var(--phosphor)] hover:text-[var(--phosphor-bright)] font-mono"
            >
              [{advOpen ? "-" : "+"}] ADVANCED CRT EFFECTS
            </button>
            {advOpen && (
              <div className="mt-3 space-y-2">
                <ToggleRow label="BLOOM_HALATION" checked={bloom} onChange={setBloom} />
                <ToggleRow label="POWER_ON_ANIM" checked={powerAnim} onChange={setPowerAnim} />
                <ToggleRow label="BURN_IN_GHOST" checked={burnIn} onChange={setBurnIn} />
                <div className="border-t border-[var(--phosphor-dim)] pt-2 mt-2">
                  <div className="mb-2 text-[var(--phosphor)]">&gt; SOUND:</div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="w-40">LOUDNESS</span>
                    {(["low", "med", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setSoundLoudness(level);
                          playToggleClick();
                        }}
                        className="border border-[var(--phosphor-dim)] text-[var(--phosphor)] px-2 py-1 font-mono text-xs hover:border-[var(--phosphor)]"
                      >
                        {soundLoudness === level ? "[*]" : "[ ]"} {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <ToggleRow label="AUTO_TYPE" checked={sndAutoType} onChange={setSndAutoType} />
                  <ToggleRow label="TOGGLE_CLICK" checked={sndToggle} onChange={setSndToggle} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          playToggleClick();
          onChange(e.target.checked);
        }}
        className="crt-checkbox"
      />
      <span className="w-40">{label}</span>
      <span className="text-[var(--phosphor)]">{checked ? "ON" : "OFF"}</span>
    </label>
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
