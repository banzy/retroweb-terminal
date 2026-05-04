import { parseWebsiteHtml, type ParsedWebsite } from "@/lib/parseWebsiteHtml";

const BROWSER_HEADERS: Record<string, string> = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const DEFAULT_FETCH_API = "fetch.php";

function resolveFetchApi(): string {
  return import.meta.env.VITE_FETCH_API?.trim() || DEFAULT_FETCH_API;
}

function explainStatus(status: number): string {
  if (status === 403)
    return "SIGNAL ERROR 403 :: HOST REFUSED CONNECTION (BOT BLOCK). TRY ANOTHER URL.";
  if (status === 404) return "SIGNAL ERROR 404 :: PAGE NOT FOUND ON HOST.";
  if (status === 429) return "SIGNAL ERROR 429 :: HOST RATE-LIMITED THIS TERMINAL.";
  if (status >= 500) return `SIGNAL ERROR ${status} :: REMOTE HOST FAILURE.`;
  return `SIGNAL ERROR ${status}`;
}

function validateHttpUrl(raw: string): string {
  if (!raw || typeof raw !== "string") throw new Error("URL required");
  const u = new URL(raw);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid protocol");
  return u.toString();
}

function resolveApiUrl(api: string): URL {
  if (typeof window === "undefined") return new URL(api, "http://localhost/");
  const appBase = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
  return new URL(api, appBase);
}

function buildApiRequestUrl(api: string, target: string): string {
  const u = resolveApiUrl(api);
  u.searchParams.set("url", target);
  return u.toString();
}

function assertApiUsable(api: string): void {
  if (typeof window === "undefined") return;
  const resolved = resolveApiUrl(api);
  if (window.location.protocol === "https:" && resolved.protocol === "http:") {
    throw new Error("FETCH API BLOCKED :: HTTPS FRONTEND CANNOT CALL AN HTTP BACKEND.");
  }
}

async function fetchTextViaApi(api: string, target: string): Promise<string> {
  assertApiUsable(api);
  const res = await fetch(buildApiRequestUrl(api, target), {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error(explainStatus(res.status));
  return res.text();
}

async function fetchBufferViaApi(
  api: string,
  target: string,
): Promise<{ buf: ArrayBuffer; contentType: string }> {
  assertApiUsable(api);
  const res = await fetch(buildApiRequestUrl(api, target));
  if (!res.ok) throw new Error(explainStatus(res.status));
  return {
    buf: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/jpeg",
  };
}

/**
 * Fetches remote HTML through the same-origin PHP API.
 * Browsers cannot read arbitrary cross-origin pages directly because of CORS.
 */
export async function fetchWebsiteContent(url: string): Promise<ParsedWebsite> {
  const target = validateHttpUrl(url);
  const html = await fetchTextViaApi(resolveFetchApi(), target);
  return parseWebsiteHtml(html, target);
}

export async function fetchImageAsDataUrl(
  url: string,
): Promise<
  | { dataUrl: string; contentType: string; error?: undefined }
  | { dataUrl: null; contentType: null; error: string }
> {
  try {
    const target = validateHttpUrl(url);
    const { buf, contentType } = await fetchBufferViaApi(resolveFetchApi(), target);

    if (buf.byteLength > 3_500_000) {
      return { dataUrl: null, contentType: null, error: "IMAGE TOO LARGE" };
    }
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    const base64 = btoa(binary);
    return { dataUrl: `data:${contentType};base64,${base64}`, contentType };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    return { dataUrl: null, contentType: null, error: `NETWORK :: ${msg}` };
  }
}
