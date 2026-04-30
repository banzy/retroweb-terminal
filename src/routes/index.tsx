import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TerminalShell } from "@/components/TerminalShell";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { UrlCommandInput } from "@/components/UrlCommandInput";
import { LoadingSequence } from "@/components/LoadingSequence";
import { TerminalOutput } from "@/components/TerminalOutput";
import { StatusLine } from "@/components/StatusLine";
import { SettingsPanel } from "@/components/SettingsPanel";
import { BootSequence } from "@/components/BootSequence";
import { fetchWebsiteContent } from "@/server/fetchWebsite.functions";
import type { ParsedWebsite } from "@/lib/parseWebsiteHtml";
import { applyThemeVars, PRESET_THEMES, type CrtTheme, type CabinetId } from "@/lib/crtThemes";
import { FONTS, getFontStack, type FontId } from "@/lib/crtFonts";
import { useEffect } from "react";
import { setSoundFlags, playModemHandshake, playErrorBeep } from "@/lib/crtSounds";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Web 1975 — Retro Terminal Website Viewer" },
      {
        name: "description",
        content:
          "View any website as if the web existed in 1975: green phosphor terminal, ASCII art, monospace, scanlines.",
      },
    ],
  }),
});

function Index() {
  const [data, setData] = useState<ParsedWebsite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("READY");
  const [asciiWidth, setAsciiWidth] = useLocalStorageState<number>("w1975.asciiWidth", 80);
  const [theme, setTheme] = useLocalStorageState<CrtTheme>("w1975.theme", PRESET_THEMES[0]);
  const [glassEnabled, setGlassEnabled] = useLocalStorageState<boolean>("w1975.glassEnabled", true);
  const [glassIntensity, setGlassIntensity] = useLocalStorageState<number>("w1975.glassIntensity", 0.35);
  const [scanlineIntensity, setScanlineIntensity] = useLocalStorageState<number>("w1975.scanlineIntensity", 0.25);
  const [bgTint, setBgTint] = useLocalStorageState<number>("w1975.bgTint", 0);
  const [bgRadial, setBgRadial] = useLocalStorageState<boolean>("w1975.bgRadial", true);
  // Advanced
  const [curvature, setCurvature] = useLocalStorageState<boolean>("w1975.curvature", false);
  const [rgbSplit, setRgbSplit] = useLocalStorageState<number>("w1975.rgbSplit", 0);
  const [bloom, setBloom] = useLocalStorageState<boolean>("w1975.bloom", false);
  const [trackingGlitch, setTrackingGlitch] = useLocalStorageState<boolean>("w1975.trackingGlitch", false);
  const [powerAnim, setPowerAnim] = useLocalStorageState<boolean>("w1975.powerAnim", false);
  const [burnIn, setBurnIn] = useLocalStorageState<boolean>("w1975.burnIn", false);
  // Sound toggles
  const [sndKeyboard, setSndKeyboard] = useLocalStorageState<boolean>("w1975.sndKeyboard", false);
  const [sndModem, setSndModem] = useLocalStorageState<boolean>("w1975.sndModem", false);
  const [sndError, setSndError] = useLocalStorageState<boolean>("w1975.sndError", false);
  const [sndToggle, setSndToggle] = useLocalStorageState<boolean>("w1975.sndToggle", false);
  const [cabinet, setCabinet] = useLocalStorageState<CabinetId>("w1975.cabinet", "none");
  const [savedThemes, setSavedThemes] = useLocalStorageState<CrtTheme[]>("w1975.savedThemes", []);
  const [bootSeq, setBootSeq] = useLocalStorageState<boolean>("w1975.bootSeq", true);
  const [fontId, setFontId] = useLocalStorageState<FontId>("w1975.fontId", "system");
  const [booting, setBooting] = useState(bootSeq);
  const [rebootKey, setRebootKey] = useState(0);
  const [forcePowerOn, setForcePowerOn] = useState(false);
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    function onReboot() {
      const y = window.scrollY;
      // Play collapse-to-middle first, then remount with power-on + boot.
      setCollapsing(true);
      window.setTimeout(() => {
        setCollapsing(false);
        setForcePowerOn(true);
        setBooting(bootSeq);
        setRebootKey((k) => k + 1);
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: "auto" });
          requestAnimationFrame(() => window.scrollTo({ top: y, left: 0, behavior: "auto" }));
        });
      }, 500);
    }
    window.addEventListener("w1975:reboot", onReboot);
    return () => window.removeEventListener("w1975:reboot", onReboot);
  }, [bootSeq]);

  useEffect(() => {
    setSoundFlags({
      keyboard: sndKeyboard,
      modem: sndModem,
      errorBeep: sndError,
      toggleClick: sndToggle,
    });
  }, [sndKeyboard, sndModem, sndError, sndToggle]);

  // Apply theme + font CSS vars to <html> so they cascade everywhere
  // immediately (including the boot overlay's pseudo-elements and the
  // very first paint), not only inside the TerminalShell subtree.
  useEffect(() => {
    const root = document.documentElement;
    const vars = applyThemeVars(theme) as Record<string, string>;
    for (const [k, v] of Object.entries(vars)) {
      if (k.startsWith("--")) root.style.setProperty(k, String(v));
    }
    root.style.setProperty(
      "--terminal-font",
      getFontStack(fontId),
    );
  }, [theme, fontId]);

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);
    setData(null);
    setStatus(`FETCHING ${url}`);
    const stopModem = playModemHandshake();
    try {
      const [result] = await Promise.all([
        fetchWebsiteContent({ data: { url } }),
        new Promise((r) => setTimeout(r, 1800)),
      ]);
      setData(result);
      setStatus("TRANSMISSION COMPLETE");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN ERROR";
      setError(msg);
      setStatus(`ERROR: ${msg}`);
      playErrorBeep();
    } finally {
      setLoading(false);
      stopModem();
    }
  }

  return (
    <>
    <TerminalShell
      key={rebootKey}
      style={{ ...applyThemeVars(theme), ["--terminal-font" as never]: getFontStack(fontId) }}
      glassEnabled={glassEnabled}
      glassIntensity={glassIntensity}
      themeLabel={theme.label}
      scanlineIntensity={scanlineIntensity}
      bgTint={bgTint}
      bgRadial={bgRadial}
      curvature={curvature}
      rgbSplit={rgbSplit}
      bloom={bloom}
      trackingGlitch={trackingGlitch}
      powerAnim={powerAnim || forcePowerOn}
      burnIn={burnIn}
      cabinet={cabinet}
      collapsing={collapsing}
    >
      <h1 className="sr-only">Web 1975 — Retro Terminal Website Viewer</h1>
      <UrlCommandInput onSubmit={handleSubmit} loading={loading} />
      <SettingsPanel
        asciiWidth={asciiWidth}
        setAsciiWidth={setAsciiWidth}
        theme={theme}
        setTheme={setTheme}
        glassEnabled={glassEnabled}
        setGlassEnabled={setGlassEnabled}
        glassIntensity={glassIntensity}
        setGlassIntensity={setGlassIntensity}
        scanlineIntensity={scanlineIntensity}
        setScanlineIntensity={setScanlineIntensity}
        bgTint={bgTint}
        setBgTint={setBgTint}
        bgRadial={bgRadial}
        setBgRadial={setBgRadial}
        curvature={curvature}
        setCurvature={setCurvature}
        rgbSplit={rgbSplit}
        setRgbSplit={setRgbSplit}
        bloom={bloom}
        setBloom={setBloom}
        trackingGlitch={trackingGlitch}
        setTrackingGlitch={setTrackingGlitch}
        powerAnim={powerAnim}
        setPowerAnim={setPowerAnim}
        burnIn={burnIn}
        setBurnIn={setBurnIn}
        sndKeyboard={sndKeyboard}
        setSndKeyboard={setSndKeyboard}
        sndModem={sndModem}
        setSndModem={setSndModem}
        sndError={sndError}
        setSndError={setSndError}
        sndToggle={sndToggle}
        setSndToggle={setSndToggle}
        cabinet={cabinet}
        setCabinet={setCabinet}
        savedThemes={savedThemes}
        setSavedThemes={setSavedThemes}
        bootSeq={bootSeq}
        setBootSeq={setBootSeq}
        fontId={fontId}
        setFontId={setFontId}
        fonts={FONTS}
      />

      {loading && <LoadingSequence />}

      {error && !loading && (
        <pre className="ascii-pre crt-text text-[var(--destructive)] text-sm border border-[var(--destructive)] p-3 mt-4">
          {`!! TRANSMISSION FAILURE !!\n!! ${error} !!`}
        </pre>
      )}

      {data && !loading && <TerminalOutput data={data} asciiWidth={asciiWidth} />}

      {!data && !loading && !error && (
        <pre className="ascii-pre crt-text text-[var(--phosphor-dim)] text-sm mt-6 whitespace-pre-wrap">
{`AWAITING INPUT...

ENTER A URL ABOVE AND PRESS [ TRANSMIT ] TO
RECEIVE A 1975-STYLE TEXT TRANSMISSION OF
ANY MODERN WEBSITE.

EXAMPLES:
  > https://en.wikipedia.org/wiki/ARPANET
  > https://news.ycombinator.com
  > https://example.com`}
        </pre>
      )}

      <StatusLine status={status} />
      {booting && bootSeq && (
        <BootSequence
          delayMs={powerAnim || forcePowerOn ? 1100 : 0}
          onDone={() => {
            setBooting(false);
            setForcePowerOn(false);
          }}
        />
      )}
    </TerminalShell>
    </>
  );
}
