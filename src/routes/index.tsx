import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TerminalShell } from "@/components/TerminalShell";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { UrlCommandInput } from "@/components/UrlCommandInput";
import { LoadingSequence } from "@/components/LoadingSequence";
import { TerminalOutput } from "@/components/TerminalOutput";
import { StatusLine } from "@/components/StatusLine";
import { SettingsPanel } from "@/components/SettingsPanel";
import { fetchWebsiteContent } from "@/server/fetchWebsite.functions";
import type { ParsedWebsite } from "@/lib/parseWebsiteHtml";
import { applyThemeVars, PRESET_THEMES, type CrtTheme } from "@/lib/crtThemes";

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
  const [flickerSpeed, setFlickerSpeed] = useLocalStorageState<number>("w1975.flickerSpeed", 0.5);
  const [scanBeamSpeed, setScanBeamSpeed] = useLocalStorageState<number>("w1975.scanBeamSpeed", 0.4);
  const [bgTint, setBgTint] = useLocalStorageState<number>("w1975.bgTint", 0);
  const [bgRadial, setBgRadial] = useLocalStorageState<boolean>("w1975.bgRadial", true);
  // Advanced
  const [curvature, setCurvature] = useLocalStorageState<boolean>("w1975.curvature", false);
  const [rgbSplit, setRgbSplit] = useLocalStorageState<number>("w1975.rgbSplit", 0);
  const [bloom, setBloom] = useLocalStorageState<boolean>("w1975.bloom", false);
  const [trackingGlitch, setTrackingGlitch] = useLocalStorageState<boolean>("w1975.trackingGlitch", false);
  const [powerAnim, setPowerAnim] = useLocalStorageState<boolean>("w1975.powerAnim", false);
  const [burnIn, setBurnIn] = useLocalStorageState<boolean>("w1975.burnIn", false);

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);
    setData(null);
    setStatus(`FETCHING ${url}`);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalShell
      style={applyThemeVars(theme)}
      glassEnabled={glassEnabled}
      glassIntensity={glassIntensity}
      themeLabel={theme.label}
      scanlineIntensity={scanlineIntensity}
      flickerSpeed={flickerSpeed}
      scanBeamSpeed={scanBeamSpeed}
      bgTint={bgTint}
      bgRadial={bgRadial}
      curvature={curvature}
      rgbSplit={rgbSplit}
      bloom={bloom}
      trackingGlitch={trackingGlitch}
      powerAnim={powerAnim}
      burnIn={burnIn}
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
        flickerSpeed={flickerSpeed}
        setFlickerSpeed={setFlickerSpeed}
        scanBeamSpeed={scanBeamSpeed}
        setScanBeamSpeed={setScanBeamSpeed}
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
    </TerminalShell>
  );
}
