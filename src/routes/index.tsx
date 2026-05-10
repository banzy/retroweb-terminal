import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TerminalShell } from "@/components/TerminalShell";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useCompactMobile, matchesCompactMobile } from "@/hooks/useCompactMobile";
import { UrlCommandInput } from "@/components/UrlCommandInput";
import { LoadingSequence } from "@/components/LoadingSequence";
import { TerminalOutput } from "@/components/TerminalOutput";
import { StatusLine } from "@/components/StatusLine";
import { SettingsPanel } from "@/components/SettingsPanel";
import { BootSequence } from "@/components/BootSequence";
import { fetchWebsiteContent } from "@/lib/fetchWebsite";
import type { ParsedWebsite } from "@/lib/parseWebsiteHtml";
import { getRandomQuote } from "@/lib/quotes";
import { MatrixSequence, NEXT_QUOTE_DELAY } from "@/components/MatrixSequence";
import { applyThemeVars, PRESET_THEMES, type CrtTheme, type CabinetId } from "@/lib/crtThemes";
import { FONTS, getFontCssVars, type FontId } from "@/lib/crtFonts";
import {
  initAudioContext,
  playRebootChime,
  rebootChimeEnabled,
  setSoundFlags,
  setSoundLoudness,
  type SoundLoudness,
} from "@/lib/crtSounds";

const DEFAULT_CONFIG = {
  asciiWidth: 80,
  theme: PRESET_THEMES[0],
  glassEnabled: true,
  glassIntensity: 0.35,
  scanlineIntensity: 0.25,
  bgTint: 0,
  bgRadial: true,
  curvature: false,
  rgbSplit: 0,
  bloom: true,
  trackingGlitch: false,
  powerAnim: true,
  burnIn: true,
  sndToggle: true,
  sndAutoType: true,
  sndReboot: true,
  soundLoudness: "low" as SoundLoudness,
  cabinet: "pet2001" as CabinetId,
  bootSeq: true,
  fontId: "system" as FontId,
};

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Wake up Neo" },
      {
        name: "description",
        content: "Wake up Neo.",
      },
    ],
  }),
});

function Index() {
  const [data, setData] = useState<ParsedWebsite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("READY");
  const [asciiWidth, setAsciiWidth] = useLocalStorageState<number>("w1975.asciiWidth", DEFAULT_CONFIG.asciiWidth);
  const [theme, setTheme] = useLocalStorageState<CrtTheme>("w1975.theme", DEFAULT_CONFIG.theme);
  const [mobilePresetRoll] = useState<CrtTheme | null>(() =>
    typeof window !== "undefined" && matchesCompactMobile()
      ? PRESET_THEMES[Math.floor(Math.random() * PRESET_THEMES.length)]!
      : null,
  );
  const isCompactMobile = useCompactMobile();
  const effectiveTheme = isCompactMobile && mobilePresetRoll ? mobilePresetRoll : theme;
  const [glassEnabled, setGlassEnabled] = useLocalStorageState<boolean>("w1975.glassEnabled", DEFAULT_CONFIG.glassEnabled);
  const [glassIntensity, setGlassIntensity] = useLocalStorageState<number>("w1975.glassIntensity", DEFAULT_CONFIG.glassIntensity);
  const [scanlineIntensity, setScanlineIntensity] = useLocalStorageState<number>("w1975.scanlineIntensity", DEFAULT_CONFIG.scanlineIntensity);
  const [bgTint, setBgTint] = useLocalStorageState<number>("w1975.bgTint", DEFAULT_CONFIG.bgTint);
  const [bgRadial, setBgRadial] = useLocalStorageState<boolean>("w1975.bgRadial", DEFAULT_CONFIG.bgRadial);
  // Advanced
  const [curvature, setCurvature] = useLocalStorageState<boolean>("w1975.curvature", DEFAULT_CONFIG.curvature);
  const [rgbSplit, setRgbSplit] = useLocalStorageState<number>("w1975.rgbSplit", DEFAULT_CONFIG.rgbSplit);
  const [bloom, setBloom] = useLocalStorageState<boolean>("w1975.bloom", DEFAULT_CONFIG.bloom);
  const [trackingGlitch, setTrackingGlitch] = useLocalStorageState<boolean>("w1975.trackingGlitch", DEFAULT_CONFIG.trackingGlitch);
  const [powerAnim, setPowerAnim] = useLocalStorageState<boolean>("w1975.powerAnim", DEFAULT_CONFIG.powerAnim);
  const [burnIn, setBurnIn] = useLocalStorageState<boolean>("w1975.burnIn", DEFAULT_CONFIG.burnIn);
  // Sound toggles
  const [sndToggle, setSndToggle] = useLocalStorageState<boolean>("w1975.sndToggle", DEFAULT_CONFIG.sndToggle);
  const [sndAutoType, setSndAutoType] = useLocalStorageState<boolean>("w1975.sndAutoType", DEFAULT_CONFIG.sndAutoType);
  const [sndReboot, setSndReboot] = useLocalStorageState<boolean>("w1975.sndReboot", DEFAULT_CONFIG.sndReboot);
  const [soundLoudnessValue, setSoundLoudnessValue] = useLocalStorageState<SoundLoudness>("w1975.soundLoudness", DEFAULT_CONFIG.soundLoudness);
  const [cabinet, setCabinet] = useLocalStorageState<CabinetId>("w1975.cabinet", DEFAULT_CONFIG.cabinet);
  const [savedThemes, setSavedThemes] = useLocalStorageState<CrtTheme[]>("w1975.savedThemes", []);
  const [bootSeq, setBootSeq] = useLocalStorageState<boolean>("w1975.bootSeq", DEFAULT_CONFIG.bootSeq);
  const [fontId, setFontId] = useLocalStorageState<FontId>("w1975.fontId", DEFAULT_CONFIG.fontId);
  const [quote, setQuote] = useState(() => getRandomQuote());
  const [skippingQuote, setSkippingQuote] = useState(false);
  const [booting, setBooting] = useState(bootSeq);
  const [rebootKey, setRebootKey] = useState(0);
  const [forcePowerOn, setForcePowerOn] = useState(false);
  const [collapsing, setCollapsing] = useState(false);

  function restoreDefaultConfig() {
    setAsciiWidth(DEFAULT_CONFIG.asciiWidth);
    setTheme(DEFAULT_CONFIG.theme);
    setGlassEnabled(DEFAULT_CONFIG.glassEnabled);
    setGlassIntensity(DEFAULT_CONFIG.glassIntensity);
    setScanlineIntensity(DEFAULT_CONFIG.scanlineIntensity);
    setBgTint(DEFAULT_CONFIG.bgTint);
    setBgRadial(DEFAULT_CONFIG.bgRadial);
    setCurvature(DEFAULT_CONFIG.curvature);
    setRgbSplit(DEFAULT_CONFIG.rgbSplit);
    setBloom(DEFAULT_CONFIG.bloom);
    setTrackingGlitch(DEFAULT_CONFIG.trackingGlitch);
    setPowerAnim(DEFAULT_CONFIG.powerAnim);
    setBurnIn(DEFAULT_CONFIG.burnIn);
    setSndToggle(DEFAULT_CONFIG.sndToggle);
    setSndAutoType(DEFAULT_CONFIG.sndAutoType);
    setSndReboot(DEFAULT_CONFIG.sndReboot);
    setSoundLoudnessValue(DEFAULT_CONFIG.soundLoudness);
    setCabinet(DEFAULT_CONFIG.cabinet);
    setBootSeq(DEFAULT_CONFIG.bootSeq);
    setFontId(DEFAULT_CONFIG.fontId);
  }

  useEffect(() => {
    function onReboot() {
      const y = window.scrollY;
      if (rebootChimeEnabled()) playRebootChime();
      // Play collapse-to-middle first, then remount with power-on + boot.
      setCollapsing(true);
      window.setTimeout(() => {
        setCollapsing(false);
        setForcePowerOn(true);
        setBooting(bootSeq);
        setData(null);
        setError(null);
        setLoading(false);
        setStatus("READY");
        setQuote(getRandomQuote());
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
    if (!bootSeq) {
      setBooting(false);
    }
  }, [bootSeq]);

  const shouldShowBootSequence = bootSeq && booting;

  useEffect(() => {
    initAudioContext();
  }, []);

  useEffect(() => {
    setSoundFlags({
      keyboard: false,
      modem: false,
      errorBeep: false,
      toggleClick: sndToggle,
      autoType: sndAutoType,
      rebootChime: sndReboot,
    });
    setSoundLoudness(soundLoudnessValue);
  }, [sndToggle, sndAutoType, sndReboot, soundLoudnessValue]);

  // Apply theme + font CSS vars to <html> so they cascade everywhere
  // immediately (including the boot overlay's pseudo-elements and the
  // very first paint), not only inside the TerminalShell subtree.
  useEffect(() => {
    const root = document.documentElement;
    const vars = applyThemeVars(effectiveTheme) as Record<string, string>;
    for (const [k, v] of Object.entries(vars)) {
      if (k.startsWith("--")) root.style.setProperty(k, String(v));
    }
    const fontVars = getFontCssVars(fontId);
    for (const [k, v] of Object.entries(fontVars)) {
      root.style.setProperty(k, v);
    }
  }, [effectiveTheme, fontId]);

  function advanceToNextQuote() {
    setSkippingQuote(true);
    window.setTimeout(() => {
      setQuote(getRandomQuote());
      setSkippingQuote(false);
    }, NEXT_QUOTE_DELAY);
  }

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);
    setData(null);
    setStatus(`FETCHING ${url}`);
    try {
      const [result] = await Promise.all([
        fetchWebsiteContent(url),
        new Promise((r) => setTimeout(r, 1800)),
      ]);
      setData(result);
      setStatus("TRANSMISSION COMPLETE");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN ERROR";
      setError(msg);
      setStatus(`ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TerminalShell
        key={rebootKey}
        style={{ ...applyThemeVars(effectiveTheme), ...getFontCssVars(fontId) }}
        glassEnabled={glassEnabled}
        glassIntensity={glassIntensity}
        themeLabel={effectiveTheme.label}
        scanlineIntensity={scanlineIntensity}
        bgTint={bgTint}
        bgRadial={bgRadial}
        curvature={curvature}
        rgbSplit={rgbSplit}
        bloom={bloom}
        trackingGlitch={trackingGlitch}
        powerAnim={powerAnim || forcePowerOn}
        burnIn={burnIn}
        cabinet={isCompactMobile ? "none" : cabinet}
        collapsing={collapsing}
        overlay={
          shouldShowBootSequence ? (
            <BootSequence
              delayMs={powerAnim || forcePowerOn ? 1100 : 0}
              onDone={() => {
                setBooting(false);
                setForcePowerOn(false);
              }}
            />
          ) : (
            <MatrixSequence
              quote={quote}
              bloomEnabled={bloom}
              skipping={skippingQuote}
              onNextQuote={advanceToNextQuote}
              nextQuoteDisabled={skippingQuote}
            >
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
                sndToggle={sndToggle}
                setSndToggle={setSndToggle}
                sndAutoType={sndAutoType}
                setSndAutoType={setSndAutoType}
                sndReboot={sndReboot}
                setSndReboot={setSndReboot}
                soundLoudness={soundLoudnessValue}
                setSoundLoudness={setSoundLoudnessValue}
                cabinet={cabinet}
                setCabinet={setCabinet}
                savedThemes={savedThemes}
                setSavedThemes={setSavedThemes}
                bootSeq={bootSeq}
                setBootSeq={setBootSeq}
                fontId={fontId}
                setFontId={setFontId}
                fonts={FONTS}
                onRestoreDefaultConfig={restoreDefaultConfig}
                onNextQuote={advanceToNextQuote}
                nextQuoteDisabled={skippingQuote}
              />
            </MatrixSequence>
          )
        }
      >
        <h1 className="sr-only">Wake up Neo</h1>
        {false && <UrlCommandInput onSubmit={handleSubmit} loading={loading} />}

        {loading && <LoadingSequence />}

        {error && !loading && (
          <pre className="ascii-pre crt-text text-[var(--destructive)] text-sm border border-current p-3 mt-4">
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
  > https://example.com

------------------------------------------------------------------------

  "${quote.quote}"

  -- ${quote.author.toUpperCase()}${quote.tags.length ? `  [${quote.tags.join(", ")}]` : ""}`}
          </pre>
        )}

        <StatusLine status={status} />
      </TerminalShell>
    </>
  );
}
