import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TerminalShell } from "@/components/TerminalShell";
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
  const [asciiWidth, setAsciiWidth] = useState(80);
  const [theme, setTheme] = useState<CrtTheme>(PRESET_THEMES[0]);
  const [glassEnabled, setGlassEnabled] = useState(true);
  const [glassIntensity, setGlassIntensity] = useState(0.35);

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
