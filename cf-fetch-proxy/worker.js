/**
 * Same-origin fetch proxy for static SPAs (avoids browser CORS + strict connect-src).
 *
 * Deploy to Cloudflare Workers and add a route on your zone, e.g.
 *   generativeworks.net/retroweb/fetch-proxy*
 *
 * Build / env:
 *   VITE_FETCH_PROXY=/retroweb/fetch-proxy
 * (path must match your Worker route; leading slash resolves to current origin in the app.)
 */
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target) {
      return new Response("missing url query param", { status: 400, headers: cors });
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch {
      return new Response("invalid url", { status: 400, headers: cors });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new Response("invalid protocol", { status: 400, headers: cors });
    }

    const upstream = await fetch(target, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const ct = upstream.headers.get("Content-Type") || "application/octet-stream";
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "Content-Type": ct,
        "Cache-Control": "private, max-age=120",
      },
    });
  },
};
