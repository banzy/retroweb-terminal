import { createServerFn } from "@tanstack/react-start";
import { parseWebsiteHtml, type ParsedWebsite } from "@/lib/parseWebsiteHtml";

export const fetchWebsiteContent = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || typeof data.url !== "string") throw new Error("URL required");
    const u = new URL(data.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid protocol");
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<ParsedWebsite> => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Web1975Terminal/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`SIGNAL ERROR ${res.status}`);
    const html = await res.text();
    return parseWebsiteHtml(html, data.url);
  });

export const fetchImageAsDataUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    const u = new URL(data.url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid protocol");
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<{ dataUrl: string; contentType: string }> => {
    const res = await fetch(data.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Web1975Terminal/1.0)" },
    });
    if (!res.ok) throw new Error(`IMAGE FETCH FAILED ${res.status}`);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = await res.arrayBuffer();
    // Limit to ~3MB
    if (buf.byteLength > 3_500_000) throw new Error("IMAGE TOO LARGE");
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    const base64 = btoa(binary);
    return { dataUrl: `data:${contentType};base64,${base64}`, contentType };
  });