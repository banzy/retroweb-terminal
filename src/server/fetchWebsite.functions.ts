import { createServerFn } from "@tanstack/react-start";
import { parseWebsiteHtml, type ParsedWebsite } from "@/lib/parseWebsiteHtml";

// Pose as a real browser — many sites (Wikipedia, Reddit, news sites) reject
// unknown / bot-looking User-Agent strings with 403.
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function explainStatus(status: number): string {
  if (status === 403)
    return "SIGNAL ERROR 403 :: HOST REFUSED CONNECTION (BOT BLOCK). TRY ANOTHER URL.";
  if (status === 404) return "SIGNAL ERROR 404 :: PAGE NOT FOUND ON HOST.";
  if (status === 429) return "SIGNAL ERROR 429 :: HOST RATE-LIMITED THIS TERMINAL.";
  if (status >= 500) return `SIGNAL ERROR ${status} :: REMOTE HOST FAILURE.`;
  return `SIGNAL ERROR ${status}`;
}

export const fetchWebsiteContent = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || typeof data.url !== "string") throw new Error("URL required");
    const u = new URL(data.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid protocol");
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<ParsedWebsite> => {
    const res = await fetch(data.url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(explainStatus(res.status));
    const html = await res.text();
    return parseWebsiteHtml(html, data.url);
  });

export const fetchImageAsDataUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    const u = new URL(data.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid protocol");
    return { url: u.toString() };
  })
  .handler(
    async ({
      data,
    }): Promise<
      | { dataUrl: string; contentType: string; error?: undefined }
      | { dataUrl: null; contentType: null; error: string }
    > => {
      try {
        const res = await fetch(data.url, { headers: BROWSER_HEADERS });
        if (!res.ok) {
          const reason =
            res.status === 429
              ? "RATE LIMITED BY HOST"
              : res.status === 403
                ? "HOST REFUSED IMAGE"
                : `HTTP ${res.status}`;
          return { dataUrl: null, contentType: null, error: reason };
        }
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const buf = await res.arrayBuffer();
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
    },
  );