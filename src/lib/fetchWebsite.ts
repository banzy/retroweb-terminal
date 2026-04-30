import { parseWebsiteHtml, type ParsedWebsite } from "@/lib/parseWebsiteHtml";

const BROWSER_HEADERS: Record<string, string> = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Public CORS proxy fallback for static frontend deploys. */
const PUBLIC_RAW_CORS_PROXY = "https://api.allorigins.win/raw?url=";

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

/** Browsers cannot read cross-origin HTML/images (CORS). Only same-origin URLs are worth fetching directly. */
function isSameOriginAsApp(target: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(target).origin === window.location.origin;
  } catch {
    return false;
  }
}

function isLikelyCorsOrNetworkFailure(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  if (e instanceof Error && /failed to fetch|networkerror|load failed/i.test(e.message)) return true;
  return false;
}

async function fetchTextViaPublicProxy(target: string): Promise<string> {
  const res = await fetch(PUBLIC_RAW_CORS_PROXY + encodeURIComponent(target), {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error(explainStatus(res.status));
  return res.text();
}

async function fetchBufferViaPublicProxy(target: string): Promise<ArrayBuffer> {
  const res = await fetch(PUBLIC_RAW_CORS_PROXY + encodeURIComponent(target), {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error(explainStatus(res.status));
  return res.arrayBuffer();
}

function proxyRequiredMessage(): Error {
  return new Error(
    "FETCH BLOCKED :: A PASSIVE FRONTEND CANNOT READ ARBITRARY SITES DIRECTLY. " +
      "ALLOW THE PUBLIC RELAY https://api.allorigins.win " +
      "OR USE TARGET SITES THAT ALREADY SEND PERMISSIVE CORS HEADERS.",
  );
}

/**
 * Fetches remote HTML. Cross-origin pages require a proxy (browser CORS).
 * Static hosting uses direct same-origin fetches or the public relay fallback.
 */
export async function fetchWebsiteContent(url: string): Promise<ParsedWebsite> {
  const target = validateHttpUrl(url);

  let html: string;

  if (isSameOriginAsApp(target)) {
    const res = await fetch(target, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!res.ok) throw new Error(explainStatus(res.status));
    html = await res.text();
  } else {
    try {
      html = await fetchTextViaPublicProxy(target);
    } catch (e) {
      if (isLikelyCorsOrNetworkFailure(e)) throw proxyRequiredMessage();
      throw e;
    }
  }

  return parseWebsiteHtml(html, target);
}

export async function fetchImageAsDataUrl(
  url: string,
): Promise<
  { dataUrl: string; contentType: string; error?: undefined } | { dataUrl: null; contentType: null; error: string }
> {
  try {
    const target = validateHttpUrl(url);

    let buf: ArrayBuffer;
    let contentType: string;

    if (isSameOriginAsApp(target)) {
      const res = await fetch(target, { redirect: "follow" });
      if (!res.ok) {
        const reason =
          res.status === 429
            ? "RATE LIMITED BY HOST"
            : res.status === 403
              ? "HOST REFUSED IMAGE"
              : `HTTP ${res.status}`;
        return { dataUrl: null, contentType: null, error: reason };
      }
      contentType = res.headers.get("content-type") || "image/jpeg";
      buf = await res.arrayBuffer();
    } else {
      try {
        buf = await fetchBufferViaPublicProxy(target);
        contentType = "image/jpeg";
      } catch (e) {
        if (isLikelyCorsOrNetworkFailure(e)) {
          return { dataUrl: null, contentType: null, error: proxyRequiredMessage().message };
        }
        const msg = e instanceof Error ? e.message : "UNKNOWN";
        return { dataUrl: null, contentType: null, error: `NETWORK :: ${msg}` };
      }
    }

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
